import React, { useEffect, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBell,
	faCircle,
	faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { expenseRoutes } from "../Routes/expenseRoutes";
import { notificationRoutes } from "../Routes/notificationRoutes";
import ExpenseForm from "./ExpenseForm";
import Expenses from "./Expenses";
import DisplayExpense from "./DisplayExpense";

const notify = (message: string, type: string, time: number = 3000) => {
	if (type === "error") {
		toast.error(message, {
			position: "top-right",
			autoClose: time,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});
	} else if (type === "success") {
		toast.success(message, {
			position: "top-right",
			autoClose: time,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});
	} else if (type === "info") {
		toast.info(message, {
			position: "top-right",
			autoClose: time,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});
	} else if (type === "warning") {
		toast.warn(message, {
			position: "top-right",
			autoClose: time,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});
	} else {
		toast("🦄 Wow so easy!", {
			position: "top-right",
			autoClose: time,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});
	}
};

type DisplayValue = "login" | "register" | "expense-form" | "expense" | "";

function Home() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [userDetails, setUserDetails] = useState<any | null>(null);
	const [token, setToken] = useState<any | null>();

	const [userExpenses, setUserExpenses] = useState([]);
	const [employeeExpenses, setEmployeeExpenses] = useState([]);
	const [notifications, setNotifications] = useState([]);

	const [active, setActive] = useState("own");

	const [display, setDisplay] = useState<DisplayValue>("");

	const [activeExpense, setActiveExpense] = useState({});

	useEffect(() => {
		const userDetails = localStorage.getItem("userInfo");
		const token = localStorage.getItem("token");
		if (token && userDetails) {
			const parsedUserDetails = JSON.parse(userDetails);
			setUserDetails(parsedUserDetails);
			setToken(token);

			setIsLoading(false);

			getExpenses(token);

			if (parsedUserDetails.userType === "manager") {
				getEmployeeExpenses(token);
			}

			getNotifications(token);
		} else {
			setIsLoading(false);
		}
	}, []);

	const getExpenses = async (token: string) => {
		if (!token) {
			return;
		}

		fetch(`${expenseRoutes.getUserExpenses}`, {
			method: "GET",
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
					setUserExpenses(res.expenses);
				}
			})
			.catch((err) => {
				console.log(err);
				notify(err.message, "error");
			})
			.finally(() => {
				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			});
	};

	const getEmployeeExpenses = async (token: string) => {
		if (!token) {
			return;
		}
		setIsLoading(true);

		fetch(`${expenseRoutes.getAllExpenses}`, {
			method: "GET",
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
					console.log(res.expenses[0])
					setEmployeeExpenses(res.expenses);
				}
			})
			.catch((err) => {
				console.log(err);
				notify(err.message, "error");
			})
			.finally(() => {
				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			});
	};

	const getNotifications = async (token: string) => {
		if (!token) {
			return;
		}

		fetch(`${notificationRoutes.getUserNotifications}`, {
			method: "GET",
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
					setNotifications(res.notifications);
				}
			})
			.catch((err) => {
				console.log(err);
				notify(err.message, "error");
			})
			.finally(() => {
				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			});
	};

	const getPendingCount = (expenses: any) => {
		const pendingExpenses = expenses.filter(
			(expense: any) => expense.status === "pending"
		);
		return pendingExpenses.length;
	};

	return (
		<div>
			<nav>
				<h1 id="logo">ECM</h1>
				<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
					<div className="paste-button">
						<button className="notification">
							<FontAwesomeIcon icon={faBell} /> {notifications.length}
						</button>
						<div className="notifications">
							{notifications.length > 0 ? (
								<div>
									{notifications.map((notification: any, index) => {
										return (
											<div
												key={index}
												// onClick={() =>
												// 	handelReadNotification(
												// 		notification.time
												// 	)
												// }
											>
												<p
													style={{
														display: "flex",
														justifyContent: "space-between",
													}}
												>
													{notification.heading}{" "}
													{!notification.isRead && (
														<FontAwesomeIcon
															icon={faCircle}
															style={{
																color: "#1aff66",
															}}
														/>
													)}
												</p>
												{/* <p>{notification.time}</p> */}
												<p>{notification.text}</p>
												{/* {notification.link && (
																<Link to={notification.link}>
																	Go{" "}
																	<FontAwesomeIcon
																		icon={faArrowRight}
																	/>
																</Link>
															)} */}
											</div>
										);
									})}
								</div>
							) : (
								<div>
									<p>No notification</p>
								</div>
							)}
						</div>
					</div>
					{userDetails && userDetails?.name ? (
						<button className="button2">{userDetails.name}</button>
					) : (
						<button
							className="button2"
							onClick={() => setDisplay("login")}
						>
							Login
						</button>
					)}
				</div>
			</nav>
			<ToastContainer />
			<main>
				<section>
					<aside id="header-content">
						<h1>Manage expenses effortlessly.</h1>
						<h3>
							Take control of your expenses with our intuitive platform.
						</h3>
						{!userDetails && (
							<button
								className="learn-more"
								onClick={() => setDisplay("login")}
							>
								<span className="circle" aria-hidden="true">
									<span className="icon arrow"></span>
								</span>
								<span className="button-text">Get Started</span>
							</button>
						)}
					</aside>
				</section>
				<section>
					<div
						style={{ display: "flex", justifyContent: "space-between" }}
					>
						<h2>Dashboard</h2>
						<div className="container">
							<div className="tabs">
								<input
									type="radio"
									id="radio-1"
									name="tabs"
									onClick={() => setActive("own")}
								/>
								<label className="tab" htmlFor="radio-1">
									Your Expenses
									<span className="total">
										{getPendingCount(userExpenses)}
									</span>
								</label>
								{userDetails && userDetails.userType === "manager" && (
									<>
										<input
											type="radio"
											id="radio-2"
											name="tabs"
											onClick={() => setActive("employee")}
										/>
										<label className="tab" htmlFor="radio-2">
											Employee Expenses
											<span className="total">
												{getPendingCount(employeeExpenses)}
											</span>
										</label>
									</>
								)}
								<span className="glider"></span>
							</div>
						</div>
						
					</div>
					<div>
						{isLoading ? (
							<>
								<div className="banter-loader">
									<div className="banter-loader__box"></div>
									<div className="banter-loader__box"></div>
									<div className="banter-loader__box"></div>
									<div className="banter-loader__box"></div>
									<div className="banter-loader__box"></div>
									<div className="banter-loader__box"></div>
									<div className="banter-loader__box"></div>
									<div className="banter-loader__box"></div>
									<div className="banter-loader__box"></div>
								</div>
							</>
						) : (
							<>
								{active === "employee" ? (
									employeeExpenses.length > 0 ? (
										<Expenses
											setDisplay={setDisplay}
											notify={notify}
											confirmAlert={confirmAlert}
											token={token}
											setUserExpenses={setUserExpenses}
											isLoading={isLoading}
											setIsLoading={setIsLoading}
											expenses={employeeExpenses}
											userType={userDetails.userType}
											setActiveExpense={setActiveExpense}

											active={active}
										/>
									) : (
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
											}}
										>
											<h3>No Expenses available</h3>
										</div>
									)
								) : userExpenses.length > 0 ? (
									<>
										<Expenses
											setDisplay={setDisplay}
											notify={notify}
											confirmAlert={confirmAlert}
											token={token}
											setUserExpenses={setUserExpenses}
											isLoading={isLoading}
											setIsLoading={setIsLoading}
											expenses={userExpenses}
											userType={userDetails.userType}
											setActiveExpense={setActiveExpense}

											active={active}
										/>
										<button
											className="button2"
											style={{ marginTop: "20px" }}
											onClick={() => setDisplay("expense-form")}
										>
											Add Expense
										</button>
									</>
								) : (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
										}}
									>
										<h3>No Expenses available</h3>
										{!userDetails ? (
											<button
												className="learn-more"
												onClick={() => setDisplay("login")}
											>
												<span className="circle" aria-hidden="true">
													<span className="icon arrow"></span>
												</span>
												<span className="button-text">
													Get Started
												</span>
											</button>
										) : (
											<button
												className="button2"
												onClick={() => setDisplay("expense-form")}
											>
												Add Expense
											</button>
										)}
									</div>
								)}
							</>
						)}
					</div>
				</section>
			</main>
			{display && (
				<div id="model-box">
					<button
						className=" model-button"
						title="close"
						onClick={() => setDisplay("")}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6 18 18 6M6 6l12 12"
							/>
						</svg>
					</button>
					{display === "login" && (
						<SignIn
							setDisplay={setDisplay}
							notify={notify}
							isLoading={isLoading}
							setIsLoading={setIsLoading}
						/>
					)}
					{display === "register" && (
						<SignUp
							setDisplay={setDisplay}
							notify={notify}
							isLoading={isLoading}
							setIsLoading={setIsLoading}
						/>
					)}
					{display === "expense-form" && (
						<ExpenseForm
							setDisplay={setDisplay}
							notify={notify}
							confirmAlert={confirmAlert}
							token={token}
							setUserExpenses={setUserExpenses}
							isLoading={isLoading}
							setIsLoading={setIsLoading}
						/>
					)}

					{display === "expense" && (
						<DisplayExpense
						
							setDisplay={setDisplay}
							notify={notify}
							confirmAlert={confirmAlert}
							token={token}
							setUserExpenses={setUserExpenses}
							isLoading={isLoading}
							setIsLoading={setIsLoading}
							expense={activeExpense}
							userType={userDetails.userType}
						/>
					)}
				</div>
			)}
		</div>
	);
}

export default Home;
