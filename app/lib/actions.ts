// use server es una directiva que se le da a las funciones que se exportan en este archivo para que se ejecuten en el servidor y no en el cliente, esto es para que no se envien al cliente y no se puedan ver en el navegador.
'use server';


import { z } from 'zod'; // Importamos zod para validar los datos que se envian en el formulario
import { sql } from '@vercel/postgres'; // Importamos sql para hacer las consultas a la base de datos
import { revalidatePath } from 'next/cache'; // Importamos revalidatePath para revalidar la pagina de invoices
import { redirect } from 'next/navigation'; // Importamos redirect para redireccionar al usuario a la pagina de invoices
import {  signIn } from '@/auth'; // Importamos signIn para autenticar al usuario
import { AuthError } from 'next-auth'; // Importamos AuthError para manejar los errores de autenticacion

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'; // Handle sign in errors
        default:
          return 'Something went wrong.'; // Handle other errors
      }
    }
    throw error;
  }
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    message: 'Please select a customer',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amont greater than 0.' }),
  status: z.enum(['pending', 'paid'], {
    message: 'Please select a status',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });


// Marcar que todas las funciones que se exporten en este archivo son asincronas y son de SERVIDOR
// y por lo tanto no se ejecutan ni se envian al cliente

// This is temporary until @types/react-dom is updated

export type State = {
  error?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice',
    };
  }

  // Prepare data for insertion into database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Con el siguiente codigo Sql se inserta un nuevo registro en la tabla invoices
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If database error ocurs, return a more specific error message
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

export async function updateInvoice(
  id: string, 
  prevState: State,
  formData: FormData
  ) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
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
  try {
    await sql`
      DELETE FROM invoices
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/invoices');

    return { message: 'Invoice Deleted' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice' };
  }

};
