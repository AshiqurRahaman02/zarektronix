import React, { useState } from "react";
import { expenseRoutes } from "../Routes/expenseRoutes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowsRotate,
	faChevronRight,
	faDownload,
	faEraser,
	faPen,
	faRotateLeft,
	faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

type DisplayValue = "login" | "register" | "expense-form" | "expense" | "";
interface Props {
	setDisplay: React.Dispatch<React.SetStateAction<DisplayValue>>;
	notify: any;
	confirmAlert: any;
	token: string;
	setUserExpenses: React.Dispatch<React.SetStateAction<any>>;
	isLoading: boolean;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

	expense: any;
	index: number;

	userType: "employee" | "manager";
	setActiveExpense: React.Dispatch<React.SetStateAction<any>>;
}
function Expense({
	setDisplay,
	notify,
	confirmAlert,
	token,
	setUserExpenses,
	setIsLoading,
	isLoading,

	expense,
	index,
	userType = "employee",
	setActiveExpense,
}: Props) {
	const [displayActions, setDisplayActions] = useState(false);

	const handelDisplayExpense = () => {
		setDisplay("expense");
		setActiveExpense(expense);
	};

	const handelApproveExpense = () => {
		confirmAlert({
			title: "Confirm to approve expense",
			message: "Are you sure, you want to approve this expense",
			buttons: [
				{
					label: "Confirm",
					onClick: async () => {
						updateExpense("approved");
					},
				},
				{
					label: "Cancel",
					onClick: () => {},
				},
			],
		});
	};

	const handelRejectExpense = () => {
		confirmAlert({
			title: "Confirm to reject expense",
			message: "Are you sure, you want to reject this expense",
			buttons: [
				{
					label: "Confirm",
					onClick: async () => {
						updateExpense("rejected");
					},
				},
				{
					label: "Cancel",
					onClick: () => {},
				},
			],
		});
	};

	const handelAskInformationExpense = () => {
		confirmAlert({
			title: "Confirm to ask for information expense",
			message: "Are you sure, you want to ask for information",
			buttons: [
				{
					label: "Confirm",
					onClick: async () => {
						let text = prompt("Please enter the information you want");
						if (!text) {
							return;
						}
						updateExpense("information-required", text);
					},
				},
				{
					label: "Cancel",
					onClick: () => {},
				},
			],
		});
	};

	const updateExpense = (type: string = "approved", text: string = "") => {
		let reqBody = {
			status: type,
			requiredText: text,
		};
		setIsLoading(true);
		fetch(`${expenseRoutes.updateExpenseStatus}/${expense._id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify(reqBody),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.isError) {
					notify(res.message, "warning");
				} else {
					notify(res.message, "success");
					setTimeout(() => {
						window.location.reload();
					}, 1000);
				}
			})
			.catch((err) => {
				console.log(err);
				notify(err.message, "error");
			})
			.finally(() => {
				setDisplay("");
				setIsLoading(false);
			});
	};

	const deleteExpense = () => {
		confirmAlert({
			title: "Confirm to submit expense",
			message: "Are you sure, you want to submit this expense",
			buttons: [
				{
					label: "Confirm",
					onClick: async () => {
						setIsLoading(true);
						fetch(`${expenseRoutes.deleteExpense}/${expense._id}`, {
							method: "DELETE",
							headers: {
								"Content-Type": "application/json",
								Authorization: token,
							},
						})
							.then((res) => res.json())
							.then((res) => {
								if (res.isError) {
									notify(res.message, "warning");
								} else {
									notify(res.message, "success");
								}
							})
							.catch((err) => {
								console.log(err);
								notify(err.message, "error");
								setIsLoading(false);
							})
							.finally(() => {
								setIsLoading(false);
								setDisplay("");
								window.location.reload();
							});
					},
				},
				{
					label: "Cancel",
					onClick: () => {},
				},
			],
		});
	};

	return (
		<tr key={index}>
			<td>{index + 1}</td>
			<td>
				<span style={{ fontWeight: "700" }}>{expense.name}</span> <br />
				<span style={{ fontWeight: "300" }} id="hide">
					{expense.description}
				</span>
			</td>
			<td id="hide">{expense.amount}</td>
			<td id="hide">{expense.category}</td>
			<td id="hide">{expense.date}</td>
			<td>
				<div
					id={expense.status}
					style={{
						padding: "10px",
						textAlign: "center",
						fontWeight: "600",
					}}
				>
					{expense.status}
				</div>
			</td>
			<td id="actions">
				<div
					id="canvas-tools"
					style={{
						position: !displayActions ? "relative" : "static",
						display: "flex",
						gap: "5px",
						transition: "2s",
						opacity: displayActions ? 1 : 0,
					}}
				>
					{userType === "manager" &&
						expense.status !== "approved" &&
						expense.status !== "rejected" && (
							<>
								<button
									style={{
										position: "absolute",
										right: displayActions ? "325px" : "-45px",
										transition: "1.9s",
										zIndex: "25",
									}}
									title="Approve the expense"
									className="button2"
									id="approve"
									onClick={handelApproveExpense}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										className="w-6 h-6"
										style={{ width: "24px" }}
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</button>
								<button
									style={{
										position: "absolute",
										right: displayActions ? "265px" : "-45px",
										transition: "1.6s",
									}}
									title="Reject the expense"
									className="button2"
									id="reject"
									onClick={handelRejectExpense}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										className="w-6 h-6"
										style={{ width: "24px" }}
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M6 18 18 6M6 6l12 12"
										/>
									</svg>
								</button>
								<button
									style={{
										position: "absolute",
										right: displayActions ? "205px" : "-45px",
										transition: "1.3s",
									}}
									title="Ask for more information"
									className="button2"
									id="info"
									onClick={handelAskInformationExpense}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										className="w-6 h-6"
										style={{ width: "24px" }}
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
										/>
									</svg>
								</button>
							</>
						)}

					<button
						style={{
							position: "absolute",
							right: displayActions ? "145px" : "-45px",
							transition: "1s",
						}}
						title="Display/Edit recipts"
						className="button2"
						onClick={handelDisplayExpense}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							className="w-6 h-6"
							style={{ width: "24px" }}
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
					</button>
					<button
						style={{
							position: "absolute",
							right: displayActions ? "85px" : "-45px",
							transition: ".7s",
						}}
						title="Delete this expense"
						onClick={deleteExpense}
						id="delete"
						className="button2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							className="w-6 h-6"
							style={{ width: "24px" }}
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
							/>
						</svg>
					</button>
				</div>
				<button
					onClick={() => setDisplayActions((pre) => !pre)}
					style={{ zIndex: "15" }}
					title={displayActions ? "Hide tools" : "Display tools"}
					className="button2"
				>
					<FontAwesomeIcon
						icon={faChevronRight}
						style={{ transition: "1s", rotate: "90deg" }}
						rotation={displayActions ? 90 : 270}
						size="xl"
					/>
				</button>
			</td>
		</tr>
	);
}

export default Expense;
