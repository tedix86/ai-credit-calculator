/**
 * Calculate cost for a given number of tokens
 * @param {number} tokens - Number of tokens
 * @param {number} pricePerMillion - Price per 1M tokens
 * @param {boolean} isCached - Whether tokens are cached
 * @param {number} cachedDiscount - Discount percentage for cached tokens (0-100)
 * @returns {number} Cost in dollars
 */
export const calculateTokenCost = (tokens, pricePerMillion, isCached = false, cachedDiscount = 0) => {
  const baseCost = (tokens / 1_000_000) * pricePerMillion;
  if (isCached) {
    return baseCost * (1 - cachedDiscount / 100);
  }
  return baseCost;
};

/**
 * Calculate cost for a single request
 * @param {Object} request - Request object with model and token counts
 * @param {Object} modelPricing - Pricing info for all models
 * @param {number} cachingPercent - Percentage of input tokens that are cached
 * @param {number} cachedDiscount - Discount percentage for cached tokens
 * @returns {Object} Cost breakdown for the request
 */
export const calculateRequestCost = (request, modelPricing, cachingPercent, cachedDiscount) => {
  const pricing = modelPricing[request.model];
  if (!pricing) {
    return {
      inputCost: 0,
      inputCachedCost: 0,
      inputUncachedCost: 0,
      outputCost: 0,
      totalCost: 0,
      numRequests: request.numRequests || 1
    };
  }

  const inputTokens = request.avgInputTokens || 0;
  const outputTokens = request.avgOutputTokens || 0;
  const numRequests = request.numRequests || 1;

  // Calculate input tokens (split into cached and uncached)
  const cachedInputTokens = inputTokens * (cachingPercent / 100);
  const uncachedInputTokens = inputTokens * (1 - cachingPercent / 100);

  const inputCachedCost = calculateTokenCost(cachedInputTokens, pricing.input, true, cachedDiscount);
  const inputUncachedCost = calculateTokenCost(uncachedInputTokens, pricing.input, false, 0);
  const inputCost = inputCachedCost + inputUncachedCost;

  // Calculate output tokens (no caching)
  const outputCost = calculateTokenCost(outputTokens, pricing.output, false, 0);

  // Multiply by number of requests
  return {
    inputCost: inputCost * numRequests,
    inputCachedCost: inputCachedCost * numRequests,
    inputUncachedCost: inputUncachedCost * numRequests,
    outputCost: outputCost * numRequests,
    totalCost: (inputCost + outputCost) * numRequests,
    cachedInputTokens: cachedInputTokens * numRequests,
    uncachedInputTokens: uncachedInputTokens * numRequests,
    numRequests
  };
};

/**
 * Calculate total cost for an AI action
 * @param {Object} action - Action object with requests and reranker flag
 * @param {Object} modelPricing - Pricing info for all models
 * @param {Object} settings - Global settings
 * @returns {Object} Cost breakdown for the action
 */
export const calculateActionCost = (action, modelPricing, settings) => {
  const requestBreakdowns = action.requests.map(request =>
    calculateRequestCost(
      request,
      modelPricing,
      settings.inputTokenCachingPercent,
      settings.cachedTokenDiscountPercent
    )
  );

  const totalTokenCost = requestBreakdowns.reduce((sum, breakdown) => sum + breakdown.totalCost, 0);
  const rerankerCost = action.useReranker ? settings.rerankerCostPerAction : 0;

  return {
    requestBreakdowns,
    totalTokenCost,
    rerankerCost,
    totalCost: totalTokenCost + rerankerCost
  };
};

/**
 * Calculate active users for each year using cohort-based model
 * @param {Object} customerMetrics - Customer metrics
 * @returns {Array} Active users by year
 */
const calculateActiveUsersByYear = (customerMetrics) => {
  const numYears = Math.max(
    customerMetrics.newCustomersPerYear?.length || 0,
    customerMetrics.adoptionRateByYear?.length || 0
  );

  const activeUsersByYear = [];

  for (let year = 0; year < numYears; year++) {
    let totalActiveUsers = 0;

    // For each cohort that exists up to this year
    for (let cohortYear = 0; cohortYear <= year; cohortYear++) {
      const numCustomersInCohort = customerMetrics.newCustomersPerYear?.[cohortYear] || 0;
      const tenureYearIndex = year - cohortYear; // How long this cohort has been a customer (0-indexed)

      // Get adoption rate for this tenure, use last rate if tenure exceeds defined rates
      const adoptionRate = customerMetrics.adoptionRateByYear?.[tenureYearIndex] ||
                          customerMetrics.adoptionRateByYear?.[customerMetrics.adoptionRateByYear.length - 1] || 0;

      const activeUsersFromCohort =
        numCustomersInCohort *
        customerMetrics.avgUsersPerCustomer *
        (adoptionRate / 100);

      totalActiveUsers += activeUsersFromCohort;
    }

    activeUsersByYear.push(Math.round(totalActiveUsers));
  }

  return activeUsersByYear;
};

/**
 * Calculate Pay-as-You-Go totals
 * @param {Object} action - Action object
 * @param {Object} modelPricing - Model pricing
 * @param {Object} customerMetrics - Customer metrics
 * @param {Object} settings - Global settings
 * @returns {Object} PayGo cost breakdown
 */
export const calculatePayGoTotal = (action, modelPricing, customerMetrics, settings) => {
  const actionCost = calculateActionCost(action, modelPricing, settings);

  // Apply PayGo discount to token costs only (not reranker)
  const discountedTokenCost = actionCost.totalTokenCost * (1 - settings.payGoDiscountPercent / 100);
  const perActionCost = discountedTokenCost + actionCost.rerankerCost;

  // Calculate per user per month (convert daily actions to monthly: × 30 days)
  const perUserMonthly = perActionCost * customerMetrics.avgActionsPerUser * 30;

  // Calculate active users by year using cohort model
  const activeUsersByYear = calculateActiveUsersByYear(customerMetrics);

  // Calculate totals by year
  const yearlyBreakdown = activeUsersByYear.map((activeUsers, yearIndex) => {
    const totalActionsPerMonth = activeUsers * customerMetrics.avgActionsPerUser * 30;
    const monthlyCost = totalActionsPerMonth * perActionCost;
    const yearlyCost = monthlyCost * 12;

    // Calculate cumulative customers up to this year
    let totalCustomers = 0;
    for (let i = 0; i <= yearIndex; i++) {
      totalCustomers += customerMetrics.newCustomersPerYear?.[i] || 0;
    }

    return {
      year: yearIndex + 1,
      totalCustomers,
      activeUsers,
      totalActionsPerMonth,
      monthlyCost,
      yearlyCost,
      perCustomerMonthly: totalCustomers > 0 ? monthlyCost / totalCustomers : 0,
      perCustomerYearly: totalCustomers > 0 ? yearlyCost / totalCustomers : 0
    };
  });

  // Use final year (Year 5) for per-action and per-user costs
  const finalYearData = yearlyBreakdown[yearlyBreakdown.length - 1] || {};

  return {
    perActionCost: finalYearData.totalActionsPerMonth > 0
      ? finalYearData.monthlyCost / finalYearData.totalActionsPerMonth
      : perActionCost,
    perUserMonthly: finalYearData.activeUsers > 0
      ? finalYearData.monthlyCost / finalYearData.activeUsers
      : perUserMonthly,
    perUserYearly: finalYearData.activeUsers > 0
      ? finalYearData.yearlyCost / finalYearData.activeUsers
      : perUserMonthly * 12,
    yearlyBreakdown,
    actionCostBreakdown: {
      tokenCost: discountedTokenCost,
      rerankerCost: actionCost.rerankerCost,
      rawTokenCost: actionCost.totalTokenCost,
      payGoDiscount: settings.payGoDiscountPercent
    },
    requestBreakdowns: actionCost.requestBreakdowns
  };
};

/**
 * Calculate required PTUs based on token throughput
 * @param {number} tokensPerSecond - Required tokens per second throughput
 * @param {number} tokensPerPTU - Tokens per second capacity per PTU (model-specific)
 * @param {number} ptuIncrements - PTU increment size (default 25)
 * @returns {number} Number of PTUs required
 */
export const calculateRequiredPTUs = (tokensPerSecond, tokensPerPTU = 4000, ptuIncrements = 25) => {
  const ptusNeeded = Math.ceil(tokensPerSecond / tokensPerPTU);

  // Round up to nearest increment
  return Math.ceil(ptusNeeded / ptuIncrements) * ptuIncrements;
};

/**
 * Calculate PTU pricing totals
 * @param {Object} action - Action object
 * @param {Object} modelPricing - Model pricing
 * @param {Object} customerMetrics - Customer metrics
 * @param {Object} settings - Global settings
 * @returns {Object} PTU cost breakdown
 */
export const calculatePTUTotal = (action, modelPricing, customerMetrics, settings) => {
  const actionCost = calculateActionCost(action, modelPricing, settings);

  // Calculate total tokens per action and weighted average PTU capacity
  let totalTokensPerAction = 0;
  let weightedPTUCapacity = 0;

  action.requests.forEach(req => {
    const tokens = ((req.avgInputTokens || 0) + (req.avgOutputTokens || 0)) * (req.numRequests || 1);
    const ptuCapacity = modelPricing[req.model]?.ptuCapacity || 4000;

    totalTokensPerAction += tokens;
    weightedPTUCapacity += tokens * ptuCapacity;
  });

  // Calculate weighted average PTU capacity based on token distribution
  const avgPTUCapacity = totalTokensPerAction > 0
    ? weightedPTUCapacity / totalTokensPerAction
    : 4000;

  // Calculate active users by year using cohort model
  const activeUsersByYear = calculateActiveUsersByYear(customerMetrics);

  // Calculate peak throughput requirements
  // This is simplified - assumes even distribution and peak = 2x average
  const yearlyBreakdown = activeUsersByYear.map((activeUsers, yearIndex) => {
    const totalActionsPerMonth = activeUsers * customerMetrics.avgActionsPerUser * 30;
    const tokensPerMonth = totalActionsPerMonth * totalTokensPerAction;

    // Estimate tokens per second (assuming 30 days, 24 hours, peak is 2x average)
    const tokensPerSecond = (tokensPerMonth / (30 * 24 * 60 * 60)) * 2;

    // Calculate required PTUs using model-specific capacity
    const requiredPTUs = calculateRequiredPTUs(tokensPerSecond, avgPTUCapacity, settings.ptuIncrements);

    // PTU costs
    const yearlyPTUCost = requiredPTUs * settings.yearlyPTUCost;
    const monthlyPTUCost = yearlyPTUCost / 12;

    // Add reranker costs (same as PayGo)
    const rerankerMonthlyCost = totalActionsPerMonth * (action.useReranker ? settings.rerankerCostPerAction : 0);
    const rerankerYearlyCost = rerankerMonthlyCost * 12;

    const totalMonthlyCost = monthlyPTUCost + rerankerMonthlyCost;
    const totalYearlyCost = yearlyPTUCost + rerankerYearlyCost;

    // Calculate cumulative customers up to this year
    let totalCustomers = 0;
    for (let i = 0; i <= yearIndex; i++) {
      totalCustomers += customerMetrics.newCustomersPerYear?.[i] || 0;
    }

    return {
      year: yearIndex + 1,
      totalCustomers,
      activeUsers,
      totalActionsPerMonth,
      tokensPerSecond,
      requiredPTUs,
      ptuMonthlyCost: monthlyPTUCost,
      ptuYearlyCost: yearlyPTUCost,
      rerankerMonthlyCost,
      rerankerYearlyCost,
      monthlyCost: totalMonthlyCost,
      yearlyCost: totalYearlyCost,
      perCustomerMonthly: totalCustomers > 0 ? totalMonthlyCost / totalCustomers : 0,
      perCustomerYearly: totalCustomers > 0 ? totalYearlyCost / totalCustomers : 0
    };
  });

  // Calculate per-action and per-user costs for final year (Year 5)
  const finalYearData = yearlyBreakdown[yearlyBreakdown.length - 1] || {};
  const perActionCost = finalYearData.totalActionsPerMonth > 0
    ? finalYearData.monthlyCost / finalYearData.totalActionsPerMonth
    : 0;
  const perUserMonthly = finalYearData.activeUsers > 0
    ? finalYearData.monthlyCost / finalYearData.activeUsers
    : 0;

  return {
    perActionCost,
    perUserMonthly,
    perUserYearly: perUserMonthly * 12,
    yearlyBreakdown,
    requestBreakdowns: actionCost.requestBreakdowns
  };
};

/**
 * Convert dollar amount to AI credits
 * @param {number} dollarAmount - Amount in dollars
 * @param {number} conversionRate - Credits per dollar
 * @returns {number} Number of AI credits
 */
export const calculateAICredits = (dollarAmount, conversionRate = 200) => {
  return dollarAmount * conversionRate;
};

/**
 * Get cost breakdown by model from request breakdowns
 * @param {Array} requests - Array of request objects
 * @param {Array} requestBreakdowns - Array of cost breakdowns
 * @returns {Object} Costs grouped by model
 */
export const getCostsByModel = (requests, requestBreakdowns) => {
  const modelCosts = {};

  requests.forEach((request, index) => {
    const breakdown = requestBreakdowns[index];
    if (!modelCosts[request.model]) {
      modelCosts[request.model] = {
        inputCost: 0,
        inputCachedCost: 0,
        inputUncachedCost: 0,
        outputCost: 0,
        totalCost: 0,
        requestCount: 0
      };
    }

    modelCosts[request.model].inputCost += breakdown.inputCost;
    modelCosts[request.model].inputCachedCost += breakdown.inputCachedCost;
    modelCosts[request.model].inputUncachedCost += breakdown.inputUncachedCost;
    modelCosts[request.model].outputCost += breakdown.outputCost;
    modelCosts[request.model].totalCost += breakdown.totalCost;
    modelCosts[request.model].requestCount += 1;
  });

  return modelCosts;
};
