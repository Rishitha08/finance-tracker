export interface CategorySet {
  income: string[]
  expense: string[]
}

export const defaultCategories: CategorySet = {
  income: [
    'Salary',
    'Business Income',
    'Side Hustle',
    'Investment Returns',
    'Rental Income',
    'Freelancing',
    'Consulting',
    'Royalties',
    'Bonus',
    'Commission',
    'Other Income'
  ],
  expense: [
    'Food & Dining',
    'Rent & Housing',
    'Transportation',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Insurance',
    'Debt Payments',
    'Savings',
    'Travel',
    'Personal Care',
    'Gifts & Donations',
    'Other Expenses'
  ]
}

export const getCategoriesForType = (type: string): string[] => {
  if (type === 'income') {
    return defaultCategories.income
  } else if (type === 'expense') {
    return defaultCategories.expense
  } else {
    return [...defaultCategories.income, ...defaultCategories.expense]
  }
}
