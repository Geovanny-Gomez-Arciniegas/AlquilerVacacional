'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchuma = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchuma.omit({ id: true, date: true });
const UpdateInvoice = FormSchuma.omit({ id: true, date: true });


// Marcar que todas las funciones que se exporten en este archivo son asincronas y son de SERVIDOR
// y por lo tanto no se ejecutan ni se envian al cliente

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Con el siguiente codigo Sql se inserta un nuevo registro en la tabla invoices
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice',
    };
  }
  // Con este codigo revalidamos la pagina de invoices para que se actualice la informacion
  // haciendo una petición al servidor y no al cache del navegador.
  revalidatePath('/dashboard/invoices');

  // Con este codigo redireccionamos al usuario a la pagina de invoices
  redirect('/dashboard/invoices');
};

// const rawFormData = Object.fromEntries(formData.entries()) // Este lo implemente para tratar de resolver el problema de que no se enviaba el formdata 

// const rawFormData = Object.fromEntries(formData.entries()) // Este lo implemente para tratar de resolver el problema de que no se enviaba el formdata

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice' };
  }


  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');
  try {
    await sql`
      DELETE FROM invoices
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/invoices');
    return { message: 'Invoice Deleted'};
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice' };
  }
};
