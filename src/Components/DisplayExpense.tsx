import React, { useEffect, useState } from "react";

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

	userType: "employee" | "manager";
}

function DisplayExpense({
	setDisplay,
	notify,
	confirmAlert,
	token,
	setUserExpenses,
	setIsLoading,
	isLoading,

	expense,
	userType = "employee",
}: Props) {
	const [activeImage, setActiveImage] = useState(expense.receiptsUrls[0]);

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, []);
	return (
		<div>
			<div className="form">
				<h2>{expense.name}</h2>
				<p>{expense.description}</p>
				<div>
					<img
						src={activeImage}
						alt=""
						style={{
							width: "100%",
							aspectRatio: "1/1",
							objectFit: "contain",
						}}
					/>
				</div>
				<div id="recipts-images">
					{expense.receiptsUrls.map((url: any) => (
						<div onMouseEnter={() => setActiveImage(url)}>
							<img src={url} alt="" style={{ width: "90px" }} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default DisplayExpense;
