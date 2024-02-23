import React, { useEffect, useRef, useState } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import SpeechRecognition, {
	useSpeechRecognition,
} from "react-speech-recognition";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { recordRoutes } from "../Routes/recordRoutes";
import { assert } from "console";
import Player from "./Player";

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

type DisplayValue = "login" | "register" | "audio" | "";

function Home() {
	const cld = new Cloudinary({
		cloud: { cloudName: process.env.REACT_APP_CLOUDNAME },
	});

	const [isLoding, setIsLoading] = useState<boolean>(true);
	const [userDetails, setUserDetails] = useState<any | null>(null);
	const [token, setToken] = useState<any | null>();

	const [isRecording, setIsRecording] = useState(false);
	const [recordingName, setRecordingName] = useState("");
	const [userMediaStream, setUserMediaStream] = useState<any | null>(null);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	const [userRecordings, setUserRecordings] = useState<any[] | []>([]);

	const [display, setDisplay] = useState<DisplayValue>("");

	const { transcript, listening, resetTranscript } = useSpeechRecognition();
	const startRecording = () => {
		SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
		setAudioBlob(null);
		setAudioUrl("");

		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				setUserMediaStream(stream);

				mediaRecorderRef.current = new MediaRecorder(stream);
				mediaRecorderRef.current.ondataavailable = (event: any) => {
					if (event.data) {
						chunksRef.current.push(event.data);
					}
				};

				mediaRecorderRef.current.onstop = () => {
					const blob = new Blob(chunksRef.current, { type: "audio/wav" });
					setAudioBlob(blob);
					setAudioUrl(URL.createObjectURL(blob));
					chunksRef.current = [];
				};
				mediaRecorderRef.current.start();

				setIsRecording(true);
				console.log("Start recording");
			})
			.catch((err) => {
				notify("Unable to access microphone", "error", 3000);
			});
	};
	const stopRecording = () => {
		if (userMediaStream) {
			userMediaStream.getTracks().forEach((track: any) => track.stop());
		} else {
			console.error(
				"userMediaStream is not defined or does not have getTracks() method"
			);
		}

		SpeechRecognition.stopListening();

		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state !== "inactive"
		) {
			mediaRecorderRef.current.stop();
		}
	};
	const clearRecording = () => {
		resetTranscript();
		startRecording();
	};

	const uploadRecording =  () => {
		confirmAlert({
			title: "Confirm to upload recording",
			message: "Are you sure, you want to upload this recording",
			buttons: [
				{
					label: "Confirm",
					onClick: async() => {
						setIsLoading(true)
						if (!audioBlob) {
							notify("Please record audio before uploading", "warning");
							return;
						}
						if (!recordingName) {
							notify("Please enter recording name", "warning");
							return;
						}
				
						const formData = new FormData();
						formData.append("audio", audioBlob);
						formData.append("name", recordingName);
						formData.append("transcript", transcript);
						try {
							const response = await fetch(`${recordRoutes.addRecord}`, {
								method: "POST",
								headers: {
									Authorization: token,
								},
								body: formData,
							});
							console.log(response);
							if (response.ok) {
								const data = await response.json();
								if (!data.isError && data.record) {
									setUserRecordings((pre) => [data.record, ...pre]);
									notify("Audio file uploaded successfully:", "success");
									setIsLoading(false)
								} else {
									notify("Error uploading audio file", "error");
									setIsLoading(false)
								}
							} else {
								notify("Internal server error", "error");
								setIsLoading(false)
							}
						} catch (error) {
							notify("Failed to upload audio file", "error");
							setIsLoading(false)
						}
					},
				},
				{
					label: "Cancel",
					onClick: () => {},
				},
			],
		});
		
	};

	useEffect(() => {
		const userDetails = localStorage.getItem("userInfo");
		const token = localStorage.getItem("token");
		if (token && userDetails) {
			const parsedUserDetails = JSON.parse(userDetails);
			setUserDetails(parsedUserDetails);
			setToken(token);

			getRecords(token);
		} else {
			setIsLoading(false);
		}
	}, []);

	const getRecords = async (token: string) => {
		if (!token) {
			return;
		}

		fetch(`${recordRoutes.getRecords}`, {
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
					setUserRecordings(res.records);
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

	return (
		<div>
			<nav>
				<h1 id="logo">EKSAQ</h1>
				{userDetails && userDetails?.name ? (
					<button className="button2">{userDetails.name}</button>
				) : (
					<button className="button2" onClick={() => setDisplay("login")}>
						Login
					</button>
				)}
			</nav>
			<ToastContainer />
			<main>
				<section>
					<aside id="header-content">
						<h1>Record, Save, and Play</h1>
						<h3>
							Start capturing your thoughts, interviews, and memos
							effortlessly.
						</h3>
						<p>
							Eksaq Audio Recorder offers a seamless experience, allowing
							you to record, pause, play, and store your audio recordings
							securely in the cloud. Explore our advanced features like
							transcript generation to enhance your audio recording
							experience.
						</p>
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
					{userDetails && (
						<aside id="recording-section">
							{isRecording ? (
								<div
									style={{
										display: "flex",
										alignItems: "center",
										flexDirection: "column",
										gap: "10px",
									}}
								>
									<p
										style={{
											display: "flex",
											alignItems: "center",
											gap: "50px",
										}}
									>
										{listening && (
											<div className="loader">
												<div className="l"></div>
												<div className="l"></div>
												<div className="l"></div>
												<div className="l"></div>
												<div className="l"></div>
												<div className="l"></div>
												<div className="l"></div>
												<div className="l"></div>
												<div className="l"></div>
											</div>
										)}
										time
									</p>
									<p>{transcript}</p>
									{audioBlob && audioUrl && (
										<div>
											<audio controls src={audioUrl} />
										</div>
									)}
									<div>
										<button
											className="button2"
											onClick={stopRecording}
										>
											Stop Recording
										</button>
									</div>
									<div style={{ width: "100%" }}>
										<div className="flex-column">
											<label>Name </label>
										</div>
										<div className="inputForm">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.4"
												stroke="currentColor"
												style={{ width: "24px" }}
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
												/>
											</svg>

											<input
												type="text"
												className="input"
												placeholder="Enter Recording Name"
												value={recordingName}
												onChange={(e) =>
													setRecordingName(e.target.value)
												}
											/>
										</div>
									</div>
									<div
										style={{
											display: "flex",
											gap: "10px",
										}}
									>
										<button
											className="button2"
											onClick={() => {
												stopRecording();
												resetTranscript();
												setIsRecording(false);
											}}
										>
											Cancel
										</button>
										<button
											onClick={clearRecording}
											className="button2"
											style={{ padding: "0.2em 1em" }}
										>
											Record Again
										</button>
										<button
											className="button2"
											onClick={uploadRecording}
										>
											Upload
										</button>
									</div>
								</div>
							) : (
								<div
									style={{
										display: "flex",
										alignItems: "center",
										flexDirection: "column",
										gap: "20px",
									}}
								>
									<div title="Start Recording" id="start-recording">
										<div>
											<div>
												<FontAwesomeIcon
													icon={faMicrophone}
													size="2xl"
													style={{
														color: "#191645",
														fontSize: "50px",
													}}
												/>
											</div>
										</div>
									</div>
									<button className="button2" onClick={startRecording}>
										Start Recording
									</button>
								</div>
							)}
						</aside>
					)}
				</section>
				<section>
					<h3>Your Recordings</h3>
					<div>
						{isLoding ? (
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
								{userRecordings.length > 0 ? (
									<div>
										{userRecordings.map((record, index)=>{
											return <>
											<Player audio={record} index={index} token={token} notify={notify}/>
											</>
										})}
									</div>
								) : (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
										}}
									>
										<h3>No Recording available</h3>
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
												onClick={startRecording}
											>
												Start Recording
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
						<SignIn setDisplay={setDisplay} notify={notify} />
					)}
					{display === "register" && (
						<SignUp setDisplay={setDisplay} notify={notify} />
					)}
				</div>
			)}
		</div>
	);
}

export default Home;
