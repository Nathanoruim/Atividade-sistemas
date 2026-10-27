import { BadRequestException, ConflictException, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

export function prismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') throw new ConflictException('Registro duplicado.');
    if (error.code === 'P2003' || error.code === 'P2014') throw new ConflictException('Registro relacionado impede esta operação.');
  }
  throw error;
}
export function assertPositiveId(id: number) { if (!Number.isInteger(id) || id < 1) throw new BadRequestException('ID inválido.'); }
