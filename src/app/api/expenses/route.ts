import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BUDGET_ALLOCATIONS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      expenses,
      allocations: BUDGET_ALLOCATIONS,
    });
  } catch (error: any) {
    console.error('Expenses GET Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, description, amount } = body;

    if (!category || !description || amount === undefined) {
      return NextResponse.json(
        { success: false, message: 'Category, description, and amount are required.' },
        { status: 400 }
      );
    }

    const validCategories = ['CREATIVE', 'TARGETED_PROMOTION', 'CONTINGENCY'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ success: false, message: 'Invalid expense category.' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Amount must be a positive number.' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        description: description.trim(),
        amount: numAmount,
        isDemo: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense logged successfully.',
      expense,
    });
  } catch (error: any) {
    console.error('Expenses POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to log expense' },
      { status: 500 }
    );
  }
}

