import React, { useEffect, useState } from "react";
import { expenseRoutes } from "../Routes/expenseRoutes";
import { imageRoutes } from "../Routes/imageRoutes";

type DisplayValue = "login" | "register" | "expense-form" | "expense" | "";
interface Props {
	setDisplay: React.Dispatch<React.SetStateAction<DisplayValue>>;
	notify: any;
	confirmAlert: any;
	token: string;
	setUserExpenses: React.Dispatch<React.SetStateAction<any>>;
	isLoading: boolean;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
function ExpenseForm({
	setDisplay,
	notify,
	confirmAlert,
	token,
	setUserExpenses,
	setIsLoading,
	isLoading,
}: Props) {
	const [heading, setHeading] = useState("");
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [expenseDate, setExpenseDate] = useState("");
	const [expenseCategory, setExpenseCategory] = useState("");
	const [reciptsUrls, setReciptsUrls] = useState<any | "">([]);

	const [imageUploadLoading, setImageUploadLoading] = useState(false);

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, []);

	const handleExpenseSubmit = (e: any) => {
		e.preventDefault();

		if (
			heading &&
			amount &&
			expenseDate &&
			expenseCategory &&
			reciptsUrls.length
		) {
			confirmAlert({
				title: "Confirm to submit expense",
				message: "Are you sure, you want to submit this expense",
				buttons: [
					{
						label: "Confirm",
						onClick: async () => {
							addExpenseFunction();
						},
					},
					{
						label: "Cancel",
						onClick: () => {},
					},
				],
			});
		} else {
			if (!heading) {
				let message = "Please enter a valid heading";
				notify(message, "warning");
			} else if (!amount) {
				let message = "Please enter the expense amount";
				notify(message, "warning");
			} else if (!expenseCategory) {
				let message = "Please enter the expense category";
				notify(message, "warning");
			} else if (!expenseDate) {
				let message = "Please select the date of expense";
				notify(message, "warning");
			} else {
				let message = "Please upload the expense recipts";
				notify(message, "warning");
			}
		}
	};
	const addExpenseFunction = () => {
		setIsLoading(true);

		let expense = {
			date: expenseDate,
			name: heading,
			description,
			amount: amount,
			category: expenseCategory,
			receiptsUrls: reciptsUrls,
		};

		fetch(expenseRoutes.addExpense, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify(expense),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.isError) {
					notify(res.message, "warning");
				} else {
					notify(res.message, "success");
					setUserExpenses((pre: any) => [res.expense, ...pre]);
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
			});
	};

	const uploadImage = (image: any) => {
		const data = new FormData();
		data.append("image", image);

		fetch(imageRoutes.upload, {
			method: "POST",
			headers: {
				Authorization: token,
			},
			body: data,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.isError) {
					notify(res.message, "error");
				} else {
					setReciptsUrls((pre: any) => [...pre, res.imageResult.url]);
				}
			})
			.catch((err) => {
				notify(err.message, "error");
			})
			.finally(() => {
				setImageUploadLoading(false);
			});
	};

	const handleImageChange = (event: any) => {
		setImageUploadLoading(true);
		const imageFile = event.target.files[0];

		if (!imageFile) {
			setImageUploadLoading(false);
			return;
		}

		const reader = new FileReader();
		reader.onload = async (e) => {
			await uploadImage(imageFile);
		};
		reader.readAsDataURL(imageFile);
	};

	const removeImage = (index: number) => {
		if (index < 0 || index >= reciptsUrls.length) {
			notify("Index out of bounds", "error");
			return;
		}

		const updatedUrls = [...reciptsUrls];

		updatedUrls.splice(index, 1);

		setReciptsUrls(updatedUrls);
	};

	return (
		<div>
			<form className="form">
				<div className="flex-column">
					<label>Heading </label>
				</div>
				<div className="inputForm">
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
							d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
						/>
					</svg>
					<input
						type="text"
						className="input"
						placeholder="Enter expense heading"
						value={heading}
						onChange={(e) => setHeading(e.target.value)}
					/>
				</div>

				<div className="flex-column">
					<label>Description</label>
				</div>
				<div className="inputForm">
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
							d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
						/>
					</svg>

					<input
						type="text"
						className="input"
						placeholder="Enter expense description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				<div className="flex-column">
					<label>Amount</label>
				</div>
				<div className="inputForm">
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
							d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						/>
					</svg>

					<input
						type="number"
						className="input"
						placeholder="Enter expense amount"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
					/>
				</div>

				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<div>
						<div className="flex-column">
							<label>Date</label>
						</div>
						<p></p>
						<div className="inputForm">
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
									d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
								/>
							</svg>

							<input
								type="date"
								className="input"
								placeholder="Enter expense description"
								value={expenseDate}
								onChange={(e) => setExpenseDate(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<div className="flex-column">
							<label>Category</label>
						</div>
						<p></p>
						<div className="inputForm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="w-6 h-6"
								style={{ width: "24" }}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M6 6h.008v.008H6V6Z"
								/>
							</svg>

							<input
								type="text"
								className="input"
								placeholder="Enter expense category"
								value={expenseCategory}
								onChange={(e) => setExpenseCategory(e.target.value)}
								list="categoryList"
							/>
							<datalist id="categoryList">
								<option>Travel</option>
								<option>Supplies</option>
								<option>Food</option>
							</datalist>
						</div>
					</div>
				</div>

				<div id="recipts-images">
					{reciptsUrls.map((recipt: any, index: number) => {
						return (
							<div>
								<img src={recipt} alt="" loading="lazy" />
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									className="w-6 h-6"
									onClick={() => removeImage(index)}
									style={{
										width: "16px",
										backgroundColor: "#ff1d1d",
										padding: "5px",
										borderRadius: "20px",
										position: "absolute",
										right: "-10px",
										top: "-10px",
										cursor: "pointer",
									}}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
									/>
								</svg>
							</div>
						);
					})}
					{imageUploadLoading && <div className="loader"></div>}
				</div>
				<div>
					<div className="flex-column">
						<label>Choose recipt</label>
					</div>
					<p></p>
					<div
						className="inputForm"
						style={{ width: "max-content", position: "relative" }}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							className="w-6 h-6"
							style={{
								width: "30px",
								position: "absolute",
								left: "45%",
							}}
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
							/>
						</svg>

						<input
							type="file"
							accept=".jpg, .png, "
							className="input"
							style={{ opacity: "0", cursor: "pointer" }}
							onChange={handleImageChange}
						/>
					</div>
				</div>

				<button className="button-submit" onClick={handleExpenseSubmit}>
					Submit Expense
				</button>
			</form>
		</div>
	);
}

export default ExpenseForm;
