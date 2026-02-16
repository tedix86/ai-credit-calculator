# AI Credit Calculator

A web-based calculator for estimating AI credits and costs for Azure OpenAI models.

## Features

- **Multiple Model Support**: GPT-4.1, GPT-4.1 mini, GPT-5, GPT-5 mini
- **Editable Pricing**: Configure model prices (per 1M tokens)
- **AI Action Builder**: Define actions with multiple API requests
- **Customer Metrics**: Project costs across customers, users, and adoption rates
- **Dual Pricing Models**: Compare Pay-as-You-Go vs PTU pricing side-by-side
- **Detailed Breakdowns**: View costs per action, per user, monthly and yearly
- **Save/Load Views**: Persist estimation views with localStorage
- **Export/Import**: Share configurations via JSON files
- **VS Code Theme**: Professional dark theme with terminal-style colors

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Usage

1. **Create New Estimation**: Click "New Estimation" in the sidebar
2. **Configure Action**: Add API requests with model selection and token counts
3. **Set Metrics**: Define customers, users, and adoption rates
4. **View Results**: See PayGo and PTU pricing side-by-side
5. **Save**: Name and save your estimation for later use
6. **Export**: Download as JSON to share or backup

## Configuration

- **Model Pricing**: Editable in the Model Pricing Editor panel
- **Global Settings**: Configure caching, PTU costs, conversion rates
- **Reranker**: Toggle semantic ranking ($0.001 per action)

## Cost Calculations

### Pay-as-You-Go
- Token costs with 20% discount
- 25% input token caching with 75% discount
- AI credits = raw cost × 200

### PTU (Provisioned Throughput Units)
- PTU increments of 25
- $2,652 per PTU per year
- Calculated based on token throughput requirements

## Browser Support

Works in all modern browsers with localStorage support.
