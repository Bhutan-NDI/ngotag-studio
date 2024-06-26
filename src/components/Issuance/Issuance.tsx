'use client';

import * as Yup from 'yup';

import { Alert, Button, Card } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getFromLocalStorage } from '../../api/Auth';
import React, { useEffect, useState } from 'react';
import BackButton from '../../commonComponents/backbutton';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import { issueCredential } from '../../api/issuance';
import { pathRoutes } from '../../config/pathRoutes';
import { AlertComponent } from '../AlertComponent';
import type {
	Attribute,
	DataTypeAttributes,
	IssuanceFormPayload,
	SchemaDetails,
	SelectedUsers,
} from './interface';
import SummaryCard from '../../commonComponents/SummaryCard';

const IssueCred = () => {
	const [schemaLoader, setSchemaLoader] = useState<boolean>(true);
	const [userLoader, setUserLoader] = useState<boolean>(true);
	const [schemaDetails, setSchemaDetails] = useState<SchemaDetails>({
		schemaName: '',
		version: '',
		schemaId: '',
		credDefId: '',
	});
	const [issuanceFormPayload, setIssuanceFormPayload] = useState<
		IssuanceFormPayload[]
	>([]);
	const [issuanceLoader, setIssuanceLoader] = useState<boolean>(false);
	const [failure, setFailure] = useState<string | null>(null);
	const [schemaAttributesDetails, setSchemaAttributesDetails] = useState<
		Attribute[]
	>([]);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getSchemaAndUsers();
		getSchemaDetails();
		return () => setUserLoader(false);
	}, []);

	const getSchemaAndUsers = async () => {
		const credDefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);
		const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

		createSchemaPayload(schemaId, credDefId);
		setUserLoader(true);
		const selectedUsers = await getSelectedUsers();
		const attributes = await getSchemaDetails();
		if (attributes && attributes?.length) {
			createIssuanceForm(selectedUsers, attributes, credDefId, orgId);
		} else {
			setFailure('Attributes are not available');
		}
	};

	const createIssuanceForm = (
		selectedUsers: SelectedUsers[],
		attributes: DataTypeAttributes[],
		credDefId: string,
		orgId: string,
	) => {
		const attrObj = attributes.map((attr) => ({
			name: attr?.attributeName,
			value: '',
			dataType: attr?.schemaDataType,
			isRequired: attr?.isRequired,
		}));
		const issuancePayload = selectedUsers.map((user) => {
			return {
				connectionId: user?.connectionId,
				attributes: attrObj,
				credentialDefinitionId: credDefId,
				orgId,
			};
		});
		setIssuanceFormPayload(issuancePayload);
		setUserLoader(false);
	};

	const createAttributeValidationSchema = (
		dataType: string,
		isRequired: boolean,
	) => {
		let attributeSchema;

		if (isRequired) {
			attributeSchema = Yup.string().required('This field is required');
		} else if (dataType === 'string') {
			attributeSchema = Yup.string().typeError('Value must be a string');
		} else if (dataType === 'number') {
			attributeSchema = Yup.number().typeError('Value must be a number');
		} else if (dataType === 'date') {
			attributeSchema = Yup.date().typeError('Value must be a valid date');
		} else {
			attributeSchema = Yup.mixed();
		}
		return Yup.object().shape({
			value: attributeSchema,
		});
	};

	const validationSchema = Yup.object().shape({
		attributes: Yup.array().of(
			Yup.lazy(({ dataType, isRequired }) =>
				createAttributeValidationSchema(dataType, isRequired),
			),
		),
	});

	const getSchemaDetails = async (): Promise<DataTypeAttributes[] | null> => {
		const schemaAttributes = await getFromLocalStorage(storageKeys.SCHEMA_ATTR);
		const parsedSchemaAttributes = JSON.parse(schemaAttributes) || [];
		setSchemaAttributesDetails(parsedSchemaAttributes?.attribute);
		return parsedSchemaAttributes.attribute;
	};

	const createSchemaPayload = async (schemaId: string, credDefId: string) => {
		if (schemaId) {
			setSchemaLoader(true);
			const parts = schemaId.split(':');
			const schemaName = parts[2];
			const version = parts[3];
			setSchemaDetails({ schemaName, version, schemaId, credDefId });
			setSchemaLoader(false);
		}
	};

	const getSelectedUsers = async (): Promise<SelectedUsers[]> => {
		const selectedUsers = await getFromLocalStorage(storageKeys.SELECTED_USER);
		return JSON.parse(selectedUsers);
	};

	const handleSubmit = async (values: IssuanceFormPayload) => {
		const convertedAttributes = values?.attributes.map((attr) => ({
			...attr,
			value: String(attr.value),
		}));

		const convertedAttributesValues = {
			...values,
			attributes: convertedAttributes,
		};

		setIssuanceLoader(true);
		const issueCredRes = await issueCredential(convertedAttributesValues);
		const { data } = issueCredRes as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setSuccess(data?.message);
			window.location.href = `${pathRoutes.organizations.issuedCredentials}`;
		} else {
			setFailure(issueCredRes as string);
			setIssuanceLoader(false);
		}
	};

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.back.issuance.connections} />
				</div>
				<AlertComponent
					message={success ?? error}
					type={success ? 'success' : 'failure'}
					onAlertClose={() => {
						setError(null);
						setSuccess(null);
					}}
				/>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Issuance
				</h1>
			</div>
			{!schemaLoader && (
				<SummaryCard
					schemaId={schemaDetails.schemaId}
					schemaName={schemaDetails.schemaName}
					version={schemaDetails.version}
					credDefId={schemaDetails.credDefId}
					hideCredDefId={false}
				/>
			)}
			{userLoader ? (
				<div className="flex items-center justify-center mb-4">
					<CustomSpinner />
				</div>
			) : (
				<>
					{issuanceFormPayload?.length
						? issuanceFormPayload?.map((user) => (
								<Formik
									key={user.connectionId}
									initialValues={user}
									validationSchema={validationSchema}
									onSubmit={handleSubmit}
								>
									{({ values, errors, touched, isValid }) => (
										<Form>
											<Card
												className="my-5"
												style={{
													maxWidth: '100%',
													maxHeight: '100%',
													overflow: 'auto',
												}}
											>
												<div className="flex justify-between">
													<h5 className="text-xl font-bold leading-none dark:text-white">
														{user.userName}
													</h5>
												</div>
												<div className="flex">
													<h5 className="text-xl font-bold leading-none dark:text-white flex flex-wrap">
														Connection Id
													</h5>
													<span className="text-xl font-bold leading-none dark:text-white pl-1">
														:
													</span>
													<p className="dark:text-white pl-1">
														{user?.connectionId}
													</p>
												</div>
												<h3 className="dark:text-white">Attributes</h3>
												<div className="container mx-auto pr-2">
													<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
														{schemaAttributesDetails &&
															schemaAttributesDetails?.length > 0 &&
															schemaAttributesDetails?.map((attr, index) => (
																<div key={attr.attributeName}>
																	<div
																		key={attr?.attributeName}
																		className="flex"
																	>
																		<label
																			htmlFor={`attributes.${index}.value`}
																			className="dark:text-white w-2/5 pr-3 flex justify-end items-center font-light"
																		>
																			<div className="flex items-center word-break-word text-end">
																				<Name attr={attr} />
																				{attr?.isRequired && (
																					<span className="text-red-500">
																						*
																					</span>
																				)}{' '}
																				:
																			</div>
																		</label>
																		<div className='w-3/5'>
																			<Field
																				type={
																					attr?.schemaDataType === 'date'
																						? 'date'
																						: attr?.schemaDataType
																				}
																				id={`attributes.${index}.value`}
																				name={`attributes.${index}.value`}
																				className="bg-gray-50 relative border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																			/>
																			{errors?.attributes &&
																				errors?.attributes[index] &&
																				touched?.attributes &&
																				touched?.attributes[index] &&
																				errors?.attributes[index]?.value && (
																					<div className="text-red-500 absolute text-xs word-break-word">
																						{errors?.attributes[index]?.value}
																					</div>
																				)}
																		</div>
																	</div>
																</div>
															))}
													</div>
												</div>
											</Card>
											{failure && (
												<div className="pt-1 pb-1">
													<Alert
														color="failure"
														onDismiss={() => setFailure(null)}
													>
														<span>
															<p>{failure}</p>
														</span>
													</Alert>
												</div>
											)}
											<div className="flex justify-end">
												<Button
													type="submit"
													disabled={!isValid || issuanceLoader}
													isProcessing={issuanceLoader}
													className='text-base text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-accent-00 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
												>
													<div className="pr-3">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															fill="none"
															viewBox="0 0 24 24"
														>
															<path
																fill="#fff"
																d="M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z"
															/>
															<path
																fill="#fff"
																d="M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z"
															/>
														</svg>
													</div>
													Issue
												</Button>
											</div>
										</Form>
									)}
								</Formik>
						  ))
						: ''}
				</>
			)}
		</div>
	);
};

const Name = (attr: { attr: any; displayName: string }) => {
	return (
		<>
			{attr?.attr?.displayName
				?.split('_')
				.map(
					(item: string | any[]) =>
						item[0].toUpperCase() + item.slice(1, item.length),
				)
				.join(' ')}
		</>
	);
};

export default IssueCred;
