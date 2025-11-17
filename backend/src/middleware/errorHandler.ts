import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly details?: unknown;

	constructor(message: string, statusCode = 500, details?: unknown) {
		super(message);
		this.statusCode = statusCode;
		this.details = details;
	}
}

export const handleControllerError = (
	error: unknown,
	next: NextFunction,
	fallbackMessage = 'Error interno del servidor'
): void => {
	if (error instanceof AppError || error instanceof ZodError) {
		next(error);
		return;
	}

	if (error instanceof Error) {
		next(error);
		return;
	}

	next(new AppError(fallbackMessage));
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
	next(new AppError(`Recurso ${req.originalUrl} no encontrado`, 404));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
	let statusCode = 500;
	let message = 'Error interno del servidor';
	let details: unknown;

	if (error instanceof AppError) {
		statusCode = error.statusCode;
		message = error.message;
		details = error.details;
	} else if (error instanceof ZodError) {
		statusCode = 400;
		message = 'Datos inválidos';
		details = error.flatten();
	} else if (error instanceof Prisma.PrismaClientKnownRequestError) {
		statusCode = 400;
		message = 'Error en la operación de base de datos';
		details = {
			code: error.code,
			meta: error.meta
		};
	} else if (error instanceof Error) {
		message = error.message || message;
	}

	res.status(statusCode).json({
		error: message,
		...(details ? { details } : {})
	});
};
