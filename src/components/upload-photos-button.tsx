"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { CameraIcon, CheckCircle, Info, Loader2, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface UploadResult {
	status: string;
	message?: string;
	fileUrl?: string;
	fileName?: string;
}

interface PhotoUploadProps {
	scriptUrl: string;
	buttonText?: string;
	allowMultiple?: boolean;
	maxFiles?: number;
	onUploadComplete?: ((files: UploadResult[]) => void) | null;
	onUploadError?: ((error: Error) => void) | null;
	className?: string;
}

type StatusType = "success" | "error" | "info" | "";

interface Status {
	message: string;
	type: StatusType;
}

const PhotoUpload = ({
	scriptUrl,
	buttonText = "📷 Upload Photos",
	allowMultiple = true,
	maxFiles = 10,
	onUploadComplete = null,
	onUploadError = null,
	className,
}: PhotoUploadProps) => {
	const [status, setStatus] = useState<Status>({ message: "", type: "" });
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);

		if (files.length === 0) return;

		if (files.length > maxFiles) {
			setStatus({
				message: `Please select no more than ${maxFiles} files`,
				type: "error",
			});
			return;
		}

		// Clear previous state
		setStatus({ message: "", type: "" });

		// Upload files
		await uploadFiles(files);
	};

	const uploadFiles = async (files: File[]) => {
		setIsUploading(true);

		let successCount = 0;
		let errorCount = 0;
		const uploadedFiles: UploadResult[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			try {
				const result = await uploadFile(file);
				successCount++;
				uploadedFiles.push(result);
			} catch (error) {
				console.error("Upload error:", error);
				errorCount++;
			}
		}

		setIsUploading(false);

		// Show result message
		if (errorCount === 0) {
			setStatus({
				message: `✓ Successfully uploaded ${successCount} photo(s)!`,
				type: "success",
			});
			onUploadComplete?.(uploadedFiles);
		} else if (successCount > 0) {
			setStatus({
				message: `⚠ Uploaded ${successCount} photo(s), ${errorCount} failed`,
				type: "info",
			});
			onUploadComplete?.(uploadedFiles);
		} else {
			setStatus({
				message: `✗ Upload failed. Please try again.`,
				type: "error",
			});
			onUploadError?.(new Error("All uploads failed"));
		}

		// Clear file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const uploadFile = (file: File): Promise<UploadResult> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = async (e: ProgressEvent<FileReader>) => {
				try {
					// Convert to base64
					const result = e.target?.result;
					if (typeof result !== "string") {
						reject(new Error("Failed to read file as string"));
						return;
					}
					const base64Data = result.split(",")[1];

					// Send to Google Apps Script
					const formData = new URLSearchParams();
					formData.append("fileData", base64Data);
					formData.append("fileName", file.name);
					formData.append("mimeType", file.type);

					const response = await fetch(scriptUrl, {
						method: "POST",
						body: formData,
					});

					const uploadResult: UploadResult = await response.json();

					if (uploadResult.status === "success") {
						resolve(uploadResult);
					} else {
						reject(new Error(uploadResult.message ?? "Upload failed"));
					}
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = () => reject(new Error("Failed to read file"));
			reader.readAsDataURL(file);
		});
	};

	return (
		<div
			className={cn(
				"mx-auto max-w-md p-5 font-sans",
				className
			)}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				multiple={allowMultiple}
				onChange={handleFileChange}
				className="hidden"
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="secondary">
						{buttonText}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuGroup>
						<div className="flex flex-col gap-2 p-2">
							<Button
								onClick={handleButtonClick}
								disabled={isUploading}
								className={cn(
									isUploading && "cursor-not-allowed"
								)}
								variant="default"
							>
								{isUploading ?
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Subindo suas fotos...</span>
									</div>
									: status.type === "success" ?
										<div className="flex items-center justify-center gap-2">
											<CheckCircle className="w-4 h-4" />
											<span>Fotos enviadas com sucesso!</span>
										</div>
										: status.type === "error" ?
											<div className="flex items-center justify-center gap-2">
												<XCircle className="w-4 h-4" />
												<span>Erro ao enviar fotos!</span>
												<span>{status.message}</span>
											</div>
											: <div className="flex items-center justify-center gap-2">
												<CameraIcon className="w-4 h-4" />
												<span>Adicionar suas fotos</span>
											</div>
								}
							</Button>

							{/* send to drive */}
							<Button variant="secondary">
								Ver as fotos do evento
							</Button>
						</div>
					</DropdownMenuGroup>

				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default PhotoUpload;
