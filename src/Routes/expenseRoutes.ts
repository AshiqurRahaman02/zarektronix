export const expenseRoutes = {
	addExpense: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/expense/add-expense`,
	getUserExpenses: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/expense/get-user-expenses`,
	getAllExpenses: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/expense/get-all-expenses`,
	updateExpense: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/expense/update-expense`,
	updateExpenseStatus: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/expense/update-expense-status`,
	deleteExpense: `${process.env.REACT_APP_BACKEND_APP_BASE_URL}/expense/delete-record`,
};
