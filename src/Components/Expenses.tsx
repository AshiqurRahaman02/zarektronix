import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { format, subMonths } from "date-fns";
import Expense from "./Expense";
import CustomShapeBar from "./CustomShapeBar";
import CustomPieChart from "./CustomPieChart";
type DisplayValue = "login" | "register" | "expense-form" | "expense" | "";
interface Props {
	setDisplay: React.Dispatch<React.SetStateAction<DisplayValue>>;
	notify: any;
	confirmAlert: any;
	token: string;
	setUserExpenses: React.Dispatch<React.SetStateAction<any>>;
	isLoading: boolean;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

	expenses: any;
	userType: "employee" | "manager";
	setActiveExpense: React.Dispatch<React.SetStateAction<any>>;
	active: string;
}
function Expenses({
	setDisplay,
	notify,
	confirmAlert,
	token,
	setUserExpenses,
	setIsLoading,
	isLoading,
	expenses,
	userType = "employee",
	setActiveExpense,
	active,
}: Props) {
	const [filterExpenses, setFilterExpenses] = useState(expenses);
	const [filter, setFilter] = useState<{
		status: string[];
		category: string[];
	}>({ status: [], category: [] });
	const [sort, setSort] = useState<string>("");

	const categories: string[] = ["Travel", "Supplies", "Food", "Other"];
	const statuses: string[] = [
		"approved",
		"pending",
		"rejected",
		"information-required",
	];

	useEffect(() => {
		// Filter expenses based on filter criteria
		let filtered = [...expenses];
		if (filter.status.length > 0) {
			filtered = filtered.filter((expense: any) =>
				filter.status.includes(expense.status)
			);
		}

		if (filter.category.length > 0) {
			if (filter.category.includes("Other")) {
				filtered = filtered.filter(
					(expense: any) =>
						(["Travel", "Supplies", "Food"].includes(expense.category) &&
							filter.category.includes(expense.category)) ||
						!["Travel", "Supplies", "Food"].includes(expense.category)
				);
			} else {
				filtered = filtered.filter((expense: any) =>
					filter.category.includes(expense.category)
				);
			}
		}

		const [field, order] = sort.split("-");
		if (field === "date") {
			filtered.sort((a: any, b: any) => {
				const dateA = new Date(a.date).getTime();
				const dateB = new Date(b.date).getTime();
				return order === "asc" ? dateA - dateB : dateB - dateA;
			});
		} else if (field === "amount") {
			filtered.sort((a: any, b: any) =>
				order === "asc" ? a.amount - b.amount : b.amount - a.amount
			);
		}

		setFilterExpenses(filtered);
	}, [expenses, filter, sort]);

	const handleFilterChange = (filterType: string, value: string) => {
		setFilter((prevFilter: any) => ({
			...prevFilter,
			[filterType]: prevFilter[filterType].includes(value)
				? prevFilter[filterType].filter((v: any) => v !== value)
				: [...prevFilter[filterType], value],
		}));
	};

	const downloadPosts = async () => {
		try {
			if (!expenses || expenses.length === 0) {
				notify("No expenses found for download", "warning");
				return;
			}

			const newExpenses = expenses.map((expense: any) => {
				const { name, description, date, amount, category, status, receiptsUrls } = expense;
			
				const transformedExpense: any = {
					heading: name,
					description: description,
					date: date,
					amount: amount,
					category: category,
					status: status,
				};
			
				receiptsUrls.forEach((url: string, index: number) => {
					transformedExpense[`receipts${index + 1}`] = url;
				});
			
				// Return the transformed expense
				return transformedExpense;
			});
			

			const workbook = XLSX.utils.book_new();
			const worksheet = XLSX.utils.json_to_sheet(newExpenses);

			XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
			const filename = `Company Expenses.xlsx`;
			XLSX.writeFile(workbook, filename);
			notify("Excel file downloaded successfully", "success");
		} catch (error) {
			console.error("Error downloading Excel file:", error);
			notify("Error downloading Excel file. Please try again", "error");
		}
	};

	const getTotalExpensesLast12Months = (
		expenses: any
	): { month: string; totalAmount: number }[] => {
		const totalExpensesByMonth: { [key: string]: number } = {};

		const currentDate = new Date();

		// Iterate over the last 12 months
		for (let i = 0; i < 12; i++) {
			const currentDateOfMonth = subMonths(currentDate, i);
			const monthLabel = format(currentDateOfMonth, "MM/yy");

			// Initialize total amount for the month
			totalExpensesByMonth[monthLabel] = 0;

			// Sum up the expenses for the current month
			expenses.forEach((expense: any) => {
				const expenseDate = new Date(expense.date);
				if (
					expenseDate.getMonth() === currentDateOfMonth.getMonth() &&
					expenseDate.getFullYear() === currentDateOfMonth.getFullYear()
				) {
					totalExpensesByMonth[monthLabel] += expense.amount;
				}
			});
		}

		return Object.entries(totalExpensesByMonth)
			.map(([month, totalAmount]) => ({
				month,
				totalAmount,
			}))
			.reverse();
	};

	const getTotalExpensesByCategory = (
		expenses: any
	): { name: string; totalAmount: number }[] => {
		const totalExpensesByCategory: { [key: string]: number } = {};

		// Iterate over expenses and aggregate total amount for each category
		expenses.forEach((expense: any) => {
			const { category, amount } = expense;
			totalExpensesByCategory[category] =
				(totalExpensesByCategory[category] || 0) + amount;
		});

		// Convert the object into an array of objects
		const result: { name: string; totalAmount: number }[] = [];
		for (const category in totalExpensesByCategory) {
			if (totalExpensesByCategory.hasOwnProperty(category)) {
				result.push({
					name: category,
					totalAmount: totalExpensesByCategory[category],
				});
			}
		}

		return result;
	};

	const getTotalExpensesByStatus = (
		expenses: any
	): { name: string; totalAmount: number }[] => {
		const totalExpensesByStatus: { [key: string]: number } = {};

		// Iterate over expenses and aggregate total amount for each category
		expenses.forEach((expense: any) => {
			const { status, amount } = expense;
			totalExpensesByStatus[status] =
				(totalExpensesByStatus[status] || 0) + amount;
		});

		// Convert the object into an array of objects
		const result: { name: string; totalAmount: number }[] = [];
		for (const category in totalExpensesByStatus) {
			if (totalExpensesByStatus.hasOwnProperty(category)) {
				result.push({
					name: category,
					totalAmount: totalExpensesByStatus[category],
				});
			}
		}

		return result;
	};

	const groupExpensesByUserName = (expenses: any) => {
		const groupedExpenses: any = {};

		expenses.forEach((expense: any) => {
			const userName = expense.userId.name;
			if (!groupedExpenses[userName]) {
				groupedExpenses[userName] = { expenses: [], totalExpense: 0 };
			}
			groupedExpenses[userName].expenses.push(expense);
			groupedExpenses[userName].totalExpense += expense.amount;
		});

		const totalExpensePerUserArray: any = Object.entries(groupedExpenses).map(
			(data: any) => ({
				name: data[0],
				totalAmount: data[1].totalExpense,
			})
		);

		console.log(totalExpensePerUserArray);

		return totalExpensePerUserArray;
	};

	const getTotalExpenses = (): number => {
		return expenses.reduce(
			(total: any, expense: any) => total + expense.amount,
			0
		);
	};

	// Function to calculate average expenses
	const getAverageExpense = ()=> {
		const totalExpenses = getTotalExpenses();
		const numExpenses = expenses.length;
		if (numExpenses === 0) return 0; 
		return (totalExpenses / numExpenses).toFixed(2);
	};

	return (
		<div>
			<div>
				<p>Total expenses: {getTotalExpenses()}</p>
				<p>Avarage expense: {getAverageExpense()}</p>
			</div>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<div>
					<div>
						<p style={{ margin: "0px" }}>Filter</p>
						<div style={{ display: "flex", gap: "20px" }}>
							<p style={{ margin: "0px" }}>
								<h4 style={{ margin: "5px 0px" }}>Status:</h4>
								<div
									style={{ display: "flex", flexDirection: "column" }}
								>
									{statuses.map((status: any) => (
										<label key={status}>
											<input
												type="checkbox"
												value={status.toLowerCase()}
												checked={filter.status.includes(status)}
												onChange={(e) =>
													handleFilterChange(
														"status",
														e.target.value
													)
												}
											/>
											{status}
										</label>
									))}
								</div>
							</p>
							<p style={{ margin: "0px" }}>
								<h4 style={{ margin: "5px 0px" }}>Category:</h4>
								<div
									style={{ display: "flex", flexDirection: "column" }}
								>
									{categories.map((category) => (
										<label key={category}>
											<input
												type="checkbox"
												value={category}
												checked={filter.category.includes(category)}
												onChange={(e) =>
													handleFilterChange(
														"category",
														e.target.value
													)
												}
											/>
											{category}
										</label>
									))}
								</div>
							</p>
						</div>
					</div>

					<div
						style={{ display: "flex", gap: "20px", alignItems: "center" }}
					>
						<h4 style={{ margin: "5px 0px" }}>Sort:</h4>
						<p>
							<select
								value={sort}
								onChange={(e) => setSort(e.target.value)}
							>
								<option value="">None</option>
								<option value="date-desc">Newest expenses</option>
								<option value="date-asc">Older expenses</option>
								<option value="amount-asc">Amount low to high</option>
								<option value="amount-desc">Amount high to low</option>
							</select>
						</p>
					</div>
				</div>

				<button type="button" className="button" onClick={downloadPosts}>
					<span className="button__text">
						Download <br /> in excel
					</span>
					<span className="button__icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke-linejoin="round"
							stroke-linecap="round"
							stroke="currentColor"
							height="24"
							fill="none"
							className="svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
							/>
						</svg>
					</span>
				</button>
			</div>
			<div>
				<table>
					<thead>
						<tr>
							<th>#</th>
							<th>
								Name / <br />
								
								<span id="hide">Description</span>
							</th>
							<th id="hide">Amount</th>
							<th id="hide">Category</th>
							<th id="hide">Date</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filterExpenses.map((expense: any, index: any) => (
							<Expense
								key={index}
								setDisplay={setDisplay}
								notify={notify}
								confirmAlert={confirmAlert}
								token={token}
								setUserExpenses={setUserExpenses}
								isLoading={isLoading}
								setIsLoading={setIsLoading}
								expense={expense}
								index={index}
								userType={userType}
								setActiveExpense={setActiveExpense}
							/>
						))}
					</tbody>
				</table>
			</div>
			<div>
				<div>
					<h2>
						{active === "own"
							? "Monthly Expenses Overview"
							: "Employee Monthly Expenses Summary"}
					</h2>

					<CustomShapeBar data={getTotalExpensesLast12Months(expenses)} />
				</div>
				<div style={{ display: "flex", justifyContent: "space-evenly",flexWrap:"wrap" }}>
					<div>
						<h2>Expenses Based on Categories</h2>

						<CustomPieChart data={getTotalExpensesByCategory(expenses)} />
					</div>
					{active === "employee" ? (
						<div>
							<h2>Expenses Based on Employee</h2>
							<CustomPieChart data={groupExpensesByUserName(expenses)} />
						</div>
					):(
						<div>
							<h2>Expenses Based on Status</h2>
							<CustomPieChart data={getTotalExpensesByStatus(expenses)} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Expenses;
