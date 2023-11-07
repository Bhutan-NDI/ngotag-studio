import * as yup from "yup";
import { Avatar, Button, Label, Modal, Tooltip } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { IMG_MAX_HEIGHT, IMG_MAX_WIDTH, apiStatusCodes, imageSizeAccepted } from '../../config/CommonConstant';
import { calculateSize, dataURItoBlob } from "../../utils/CompressImage";
import { AlertComponent } from "../AlertComponent";
import type { AxiosResponse } from 'axios';
import { updateOrganization } from "../../api/organization";
import { updateEcosystem } from "../../api/ecosystem";
import type { Organisation } from "../organization/interfaces";
import type { Ecosystem } from "../Ecosystem/interfaces";
import React, { useEffect, useState } from "react";

interface EditEntityModalProps {
    openModal: boolean;
    setMessage: (message: string) => void;
    setOpenModal: (flag: boolean) => void;
    onEditSuccess?: () => void;
    entityData: Ecosystem | null;
    isOrganization: boolean; 
    
}

interface EditEntityValues {
    name: string;
    description: string;
    autoEndorsement: boolean;
}

interface ILogoImage {
    logoFile: string | File;
    imagePreviewUrl: string | ArrayBuffer | null | File;
    fileName: string;
}

const EditPopupModal = (props: EditEntityModalProps) => {
    const [logoImage, setLogoImage] = useState<ILogoImage>({
        logoFile: "",
        imagePreviewUrl: props?.entityData?.logoUrl ?? "",
        fileName: '',
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [isImageEmpty, setIsImageEmpty] = useState(true);
    const [initialEntityData, setInitialEntityData] = useState<EditEntityValues>({
        name: "",
        description: "",
        autoEndorsement: false,
    });

    useEffect(() => {
                if (props.openModal && props.entityData) {
            setInitialEntityData({
                name: props.entityData.name ?? "",
                description: props.entityData.description ?? "",
                autoEndorsement: props.entityData.autoEndorsement ?? false
            });
            isSetautoEndorse(props.entityData.autoEndorsement)
            setLogoImage({
                logoFile: "",
                imagePreviewUrl: props.entityData.logoUrl ?? "",
                fileName: props.entityData.logoFile ?? "",
            });
        }
    }, [props.entityData, props.openModal]);

    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [imgError, setImgError] = useState('');
    const [isautoEndorse, isSetautoEndorse] = useState(false)


    useEffect(() => {
        if (!props.openModal) {
            setInitialEntityData({
                name: "",
                description: "",
                autoEndorsement: false
            });

            setLogoImage({
                                logoFile: "",
                imagePreviewUrl: "",
                fileName: "",
            });
            setImgError('');
            setErrMsg(null);
            setLoading(false);
        }
    }, [props.openModal]);
 
    const processImage = (e: any): string | undefined => {
        const file = e?.target?.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event): void => {
            const imgElement = document.createElement("img");
            if (imgElement) {
                imgElement.src = typeof event?.target?.result === 'string' ? event.target.result : "";
                imgElement.onload = (e): void => {
                    let fileUpdated: File | string = file;
                    let srcEncoded = '';
                    const canvas = document.createElement("canvas");

                    const { width, height, ev } = calculateSize(imgElement, IMG_MAX_WIDTH, IMG_MAX_HEIGHT);
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    if (ctx && e?.target) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = "high";
                        ctx.drawImage(ev, 0, 0, canvas.width, canvas.height);
                        srcEncoded = ctx.canvas.toDataURL(ev, file.type);
                        const blob = dataURItoBlob(srcEncoded, file.type);
                        fileUpdated = new File([blob], file.name, { type: file.type, lastModified: new Date().getTime() });
                        setLogoImage({
                            logoFile: fileUpdated,
                            imagePreviewUrl: srcEncoded,
                            fileName: file.name
                        });
                    }
                };
            }
        };
    };
 
    const handleImageChange = (event: any): void => {
        setImgError('');
        const reader = new FileReader();
        const file = event?.target?.files;
       
        const fileSize = Number((file[0]?.size / 1024 / 1024)?.toFixed(2));
        const extension = file[0]?.name?.substring(file[0]?.name?.lastIndexOf(".") + 1)?.toLowerCase();

        if (extension === "png" || extension === "jpeg" || extension === "jpg") {
            if (fileSize <= imageSizeAccepted) {
                reader.onloadend = (): void => {
                    processImage(event);
                    setIsImageEmpty(false);
                };
                reader.readAsDataURL(file[0]);
                event.preventDefault();
            } else {
                setImgError("Please check image size");
            }
        } else {
            setImgError("Invalid image type");
        }
    };

    const isEmpty = (object: any): boolean => {

        return true;
    };

    const submitUpdateEntity = async (values: EditEntityValues) => {
        setLoading(true);

        const entityData = {
            id: props?.entityData?.id,
            name: values.name,
            description: values.description,
            logo: logoImage?.imagePreviewUrl as string || props?.entityData?.logoUrl,
            autoEndorsement:isautoEndorse
        };

        try {
            if (props.isOrganization) {
                const response = await updateOrganization(entityData, entityData.id?.toString() as string);
                const { data } = response as AxiosResponse;
                if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                    if (props?.onEditSuccess) {
                        props?.onEditSuccess();
                    }
                    props.setOpenModal(false);
                } else {
                    setErrMsg(data?.message as string);
                }
            } else {
                const response = await updateEcosystem(entityData);
                const { data } = response as AxiosResponse;

                if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                    if (props?.onEditSuccess) {
                        props?.onEditSuccess();
                    }
                    props.setOpenModal(false);
                } else {
                    setErrMsg(data?.message as string);
                }
            }
        } catch (error) {
            console.error("An error occurred:", error);
            setLoading(false);
        }
    };
    return (
			<Modal
			size={'3xl'}
				show={props.openModal}
				onClose={() => {
					setLogoImage({
						logoFile: '',
						imagePreviewUrl: '',
						fileName: '',
					});
					setInitialEntityData({
						name: '',
						description: '',
                        
					});
					props.setOpenModal(false);
				}}
			>
				<Modal.Header>
					Edit {props.isOrganization ? 'Organization' : 'Ecosystem'}
				</Modal.Header>
				<Modal.Body>
					<AlertComponent
						message={errMsg}
						type={'failure'}
						onAlertClose={() => {
							setErrMsg(null);
						}}
					/>
					<Formik
						initialValues={initialEntityData}
						validationSchema={yup.object().shape({
							name: yup
								.string()
								.min(
									2,
									`${
										props.isOrganization ? 'Organization' : 'Ecosystem'
									} name must be at least 2 characters`,
								)
								.max(
									50,
									`${
										props.isOrganization ? 'Organization' : 'Ecosystem'
									} name must be at most 50 characters`,
								)
								.required(
									`${
										props.isOrganization ? 'Organization' : 'Ecosystem'
									} name is required`,
								)
								.trim(),
							description: yup
								.string()
								.min(2, 'Description must be at least 2 characters')
								.max(255, 'Description must be at most 255 characters')
								.required('Description is required'),
						})}
						validateOnBlur
						validateOnChange
						enableReinitialize
						onSubmit={async (
							values: EditEntityValues,
							{ resetForm }: FormikHelpers<EditEntityValues>,
						) => {
							await submitUpdateEntity(values);
						}}
					>
						{(formikHandlers): JSX.Element => (
							<Form
								className="space-y-6"
								onSubmit={formikHandlers.handleSubmit}
							>
								<div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
									<div className="items-center sm:flex 2xl:flex sm:space-x-4 xl:space-x-4 2xl:space-x-4">
										{logoImage.imagePreviewUrl ? (
											<img
												className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
												src={logoImage.imagePreviewUrl}
												alt={`${
													props.isOrganization ? 'Organization' : 'Ecosystem'
												} Logo`}
											/>
										) : (
											<Avatar size="lg" />
										)}

										<div>
											<h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
												{props.isOrganization
													? 'Organization Logo'
													: 'Ecosystem Logo'}
											</h3>
											<div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
												JPG, JPEG and PNG. Max size of 1MB
											</div>
											<div className="flex items-center space-x-4">
												<div>
													<label htmlFor="entityLogo">
														<div className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-center rounded-lg">
															Choose file
														</div>
														<input
															type="file"
															accept="image/*"
															name="file"
															className="hidden"
															id="entityLogo"
															title=""
															onChange={(event): void =>
																handleImageChange(event)
															}
														/>
														{imgError ? (
															<div className="text-red-500">{imgError}</div>
														) : (
															<span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
																{logoImage.fileName}
															</span>
														)}
													</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="name" value="Name" />
										<span className="text-red-500 text-xs">*</span>
									</div>
									<Field
										id="name"
										name="name"
										value={formikHandlers.values.name}
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										placeholder={`Enter ${
											props.isOrganization ? 'Organization' : 'Ecosystem'
										} Name`}
										onChange={(e) => {
											const value = e.target.value;
											formikHandlers.setFieldValue('name', value);
											formikHandlers.setFieldTouched('name', true);

											if (value.length > 50) {
												formikHandlers.setFieldError(
													'name',
													props.isOrganization
														? 'Organization name must be at most 50 characters'
														: 'Ecosystem name must be at most 50 characters',
												);
											} else {
												formikHandlers.setFieldError('name', undefined);
											}
										}}
									/>
									{formikHandlers?.errors?.name &&
										formikHandlers?.touched?.name && (
											<span className="text-red-500 text-xs">
												{formikHandlers?.errors?.name}
											</span>
										)}
								</div>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="description" value="Description" />
										<span className="text-red-500 text-xs">*</span>
									</div>
									<Field
										id="description"
										name="description"
										value={formikHandlers.values.description}
										as="textarea"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										placeholder={`Enter ${
											props.isOrganization ? 'Organization' : 'Ecosystem'
										} Description`}
										onChange={(e) => {
											const value = e.target.value;
											formikHandlers.setFieldValue('description', value);
											formikHandlers.setFieldTouched('description', true);

											if (value.length > 50) {
												formikHandlers.setFieldError(
													'description',
													'Description must be at most 255 characters',
												);
											} else {
												formikHandlers.setFieldError('description', undefined);
											}
										}}
									/>
									{formikHandlers?.errors?.description &&
										formikHandlers?.touched?.description && (
											<span className="text-red-500 text-xs">
												{formikHandlers?.errors?.description}
											</span>
										)}
								</div>
								<div>
                                <div className="flex items-center">
											<Label htmlFor="name" value="Endorsement Flow" />
											<div className="block dark:hidden">
												<Tooltip
													className="shadow-[0_0_12px_12px_rgba(0,0,0,0.1)]"
													placement='top-start'
													style="light"
													content={
														<img
															src="/images/Endorsement_Infographic_Ligh_Mode.svg"
															height={600}
															width={450}
														/>
													}
												>
													<svg
														className="ml-2"
														xmlns="http://www.w3.org/2000/svg"
														width="12"
														height="12"
														fill="none"
														viewBox="0 0 12 12"
													>
														<path
															fill="#1D4EB5"
															fill-rule="evenodd"
															d="M0 6a6 6 0 1 1 12 0A6 6 0 0 1 0 6ZM6 .837a5.163 5.163 0 1 0 0 10.326A5.163 5.163 0 0 0 6 .837Z"
															clip-rule="evenodd"
														/>
														<path
															fill="#1D4EB5"
															d="M6 9.21a.419.419 0 0 0 .42-.42V5.443a.419.419 0 0 0-.838 0v3.349c0 .231.187.418.419.418Zm0-6a.558.558 0 1 1 0 1.117.558.558 0 0 1 0-1.116Z"
														/>
													</svg>
												</Tooltip>
											</div>
											<div className="hidden dark:block">
												<Tooltip
												className="shadow-[0_0_12px_12px_rgba(0,0,0,0.1)]"
												placement='top-start'
													style="dark"
													content={
														<img
															src="/images/Endorsement_Infographic_Dark_Mode.svg"
															height={600}
															width={450}
														/>
													}
												>
													<svg
														className="ml-2 dark:text-white"
														xmlns="http://www.w3.org/2000/svg"
														width="12"
														height="12"
														fill="none"
														viewBox="0 0 12 12"
													>
														<path
															fill="currentColor"
															fill-rule="evenodd"
															d="M0 6a6 6 0 1 1 12 0A6 6 0 0 1 0 6ZM6 .837a5.163 5.163 0 1 0 0 10.326A5.163 5.163 0 0 0 6 .837Z"
															clip-rule="evenodd"
														/>
														<path
															fill="currentColor"
															d="M6 9.21a.419.419 0 0 0 .42-.42V5.443a.419.419 0 0 0-.838 0v3.349c0 .231.187.418.419.418Zm0-6a.558.558 0 1 1 0 1.117.558.558 0 0 1 0-1.116Z"
														/>
													</svg>
												</Tooltip>
											</div>
										</div>

									<label htmlFor="sign" className="block w-fit">
										<input
											className=""
											type="radio"
											id="sign"
											name="autoEndorsement"
											checked={isautoEndorse === false}
											onChange={() => isSetautoEndorse(false)}
										/>
										<span className="ml-2 text-gray-900 dark:text-white text-sm">
											Sign
										</span>
									</label>

									<label htmlFor="sign-submit" className="block w-fit">
										<input
											className=""
											type="radio"
											id="sign-submit"
											name="autoEndorsement"
											checked={isautoEndorse === true}
											onChange={() => isSetautoEndorse(true)}
										/>
										<span className="ml-2 text-gray-900 dark:text-white text-sm">
											Sign and Submit
										</span>
									</label>
								</div>
								<Button
									type="submit"
									isProcessing={loading}
									className="float-right text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									Update
								</Button>
							</Form>
						)}
					</Formik>
				</Modal.Body>
			</Modal>
		);
};

export default EditPopupModal;
