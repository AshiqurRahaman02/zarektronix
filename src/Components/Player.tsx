import React, { useEffect, useRef, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import ReactHowler from "react-howler";
import { Slider } from "@mui/material";
import { recordRoutes } from "../Routes/recordRoutes";

interface Props {
	audio: any;
	index: number;
	token: string;
	notify: any;
}

function Player({ audio, index = 0, token, notify }: Props) {
	const audioRef = useRef<any | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [volume, setVoulume] = useState(100);

	const [isPlaying, setIsPlaying] = useState(false);

	const [isFavorite, setIsFavorite] = useState(false);
	const [displayTranscript, setDisplayTranscript] = useState(false);

	useEffect(() => {
		let interval: any;

		const handleInterval = () => {
			setCurrentTime(audioRef.current.seek());
		};

		if (isPlaying) {
			interval = setInterval(handleInterval, 500);
		} else {
			clearInterval(interval);
		}

		return () => clearInterval(interval);
	}, [isPlaying]);

	const getDuration = () => {
		let timeInSeconds = audioRef.current?._howler?._duration || 0;
		return getTime(timeInSeconds) || "0:00";
	};

	const dragHandler = (e: any) => {
		const seekTime = parseFloat(e.target.value);
		setCurrentTime(seekTime);
		audioRef.current.seek(seekTime);
	};

	const getTime = (time: any) => {
		return (
			Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2)
		);
	};
	const handleOnLoad = () => {
		const duration = audioRef?.current?.duration();
		console.log("Duration:", duration);
	};

	const deleteRecording = () => {
		confirmAlert({
			title: "Confirm to delete recording",
			message: "Are you sure, you want to delete this recording",
			buttons: [
				{
					label: "Confirm",
					onClick: () => {
						fetch(`${recordRoutes.deleteRecord}/${audio._id}`, {
							method: "DELETE",
							headers: {
								Authorization: token,
							},
						})
							.then((res) => res.json())
							.then((res) => {
								if (res.isError) {
									notify(res.message, "error");
								} else {
									notify(res.message, "success");
									window.location.reload();
								}
							})
							.catch((error) => {
								notify(error.message, "error");
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
	function timeConverter(inputDate: Date | string): string {
		const currentDate = new Date();
		const inputDateTime = new Date(inputDate);
		const timeDifferenceInSeconds = Math.floor(
			(currentDate.getTime() - inputDateTime.getTime()) / 1000
		);

		const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

		if (timeDifferenceInSeconds < 60) {
			return rtf.format(-timeDifferenceInSeconds, "second");
		} else if (timeDifferenceInSeconds < 3600) {
			const minutes = Math.floor(timeDifferenceInSeconds / 60);
			return rtf.format(-minutes, "minute");
		} else if (timeDifferenceInSeconds < 86400) {
			const hours = Math.floor(timeDifferenceInSeconds / 3600);
			return rtf.format(-hours, "hour");
		} else {
			const options: Intl.DateTimeFormatOptions = {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			};
			return inputDateTime.toLocaleDateString("en-US", options);
		}
	}

	const downloadRecording = async () => {
		const response = await fetch(audio.audioUrl);

		const file = await response.blob();
		const link = document.createElement("a");
		link.href = URL.createObjectURL(file);
		link.download = `audio-${new Date().getTime()}`;
		link.click();
	};
	return (
		<div key={index}>
			<div
				id="playing-container"
				style={{
					display: "flex",
					gap: "15px",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
				}}
			>
				<div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
					<button
						className="model-button"
						style={{
							position: "relative",
							zIndex: "1",
							top: "0",
							right: "0",
						}}
					>
						{index + 1}
					</button>
					<button
						className="model-button"
						style={{
							position: "relative",
							zIndex: "1",
							top: "0",
							right: "0",
							backgroundColor: "#1fdf64",
							borderRadius: "50%",
							border: "1px solid #0000003b",
							width: "50px",
							height: "50px",
						}}
						onClick={() => setIsPlaying((pre) => !pre)}
						title={isPlaying ? "Stop Playing" : "Start Playing"}
					>
						{isPlaying ? (
							<svg
								data-encore-id="icon"
								role="img"
								aria-hidden="true"
								viewBox="0 0 16 16"
								className="Svg-sc-ytk21e-0 dYnaPI"
							>
								<path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
							</svg>
						) : (
							<svg
								data-encore-id="icon"
								role="img"
								aria-hidden="true"
								viewBox="0 0 16 16"
								className="Svg-sc-ytk21e-0 kPpCsU"
							>
								<path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path>
							</svg>
						)}
					</button>
					<div>
						<p
							style={{
								fontSize: "18px",
								margin: "0",
								fontStyle: "italic",
							}}
						>
							{audio.name}
						</p>
						<div
							style={{
								display: "flex",
								gap: "15px",
								alignItems: "center",
							}}
						>
							<p>{getTime(currentTime) || "0:00"}</p>
							<div>
								<Slider
									aria-label="Temperature"
									min={0}
									max={audioRef.current?._howler?._duration}
									value={currentTime}
									onChange={(e) => dragHandler(e)}
									// size="small"
									id="slider"
									style={{
										width: "250px",
										color: "#1fdf64",
										padding: "0",
									}}
								/>
								<ReactHowler
									src={audio.audioUrl}
									ref={audioRef}
									playing={isPlaying}
									loop={false}
									volume={volume / 100}
									onEnd={() => setIsPlaying(false)}
									onLoad={handleOnLoad}
								/>
							</div>
							<p>{getDuration()}</p>
						</div>
					</div>
				</div>
				{audio.createdAt && (
					<p>Recorded {timeConverter(audio.createdAt)}</p>
				)}
				<div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
					<div
						title={
							isFavorite ? "Remove from favorite" : "Add to favorite"
						}
					>
						{isFavorite ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-6 h-6"
								onClick={() => setIsFavorite(false)}
							>
								<path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="w-6 h-6"
								onClick={() => setIsFavorite(true)}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
								/>
							</svg>
						)}
					</div>
					<div
						style={{ display: "flex", gap: "10px", alignItems: "center" }}
						title={volume > 0 ? "Mute" : "Unmute"}
					>
						{volume > 0 ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="w-6 h-6"
								onClick={() => setVoulume(0)}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
								/>
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="w-6 h-6"
								onClick={() => setVoulume(100)}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
								/>
							</svg>
						)}

						<Slider
							aria-label="Temperature"
							value={volume}
							onChange={(e: any) => setVoulume(e.target?.value)}
							size="small"
							id="slider"
							style={{ width: "100px", color: "#1fdf64" }}
						/>
					</div>
					<div
						title={
							displayTranscript ? "Hide Transcript" : "Show Transcript"
						}
					>
						{displayTranscript ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="w-6 h-6"
								onClick={() => setDisplayTranscript(false)}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
								/>
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="w-6 h-6"
								onClick={() => setDisplayTranscript(true)}
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
						)}
					</div>
					<div title="Share Recording">
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
								d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
							/>
						</svg>
					</div>
					<div title="Download Recording" onClick={downloadRecording}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="w-6 h-6"
						>
							<path
								fill-rule="evenodd"
								d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div title="Delete Recording" onClick={deleteRecording}>
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
								d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
							/>
						</svg>
					</div>
				</div>
			</div>

			{displayTranscript && <p>{audio.transcript}</p>}
		</div>
	);
}

export default Player;
