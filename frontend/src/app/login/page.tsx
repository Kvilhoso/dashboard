'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import Image from 'next/image';
import * as yup from 'yup';

import { useAuthStore } from '@/store/authStore';
import { CopyRight, GenericButton, TextField } from '@/components';
import { email, password } from '@/validations';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object({
  email,
  password,
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const { control, watch, handleSubmit } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema),
  });

  const isDisabled = !watch('email') || !watch('password');

  const onSubmit = handleSubmit(async data => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setToken('demo-token-' + Date.now());
    setUser({
      id: '1',
      name: data.email.split('@')[0] || 'Usuário',
      email: data.email,
      plan: null,
    });
    router.push('/dashboard');
    setLoading(false);
  });

  return (
    <main className='min-h-screen w-full flex flex-col items-center justify-center bg-black px-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8 relative z-10'
      >
        <div className='flex flex-col items-center gap-2 mb-8'>
          <Image
            src='/logo-circle.png'
            alt='projeKt Rage logo'
            width={48}
            height={48}
            className='size-12'
          />

          <h1 className='text-2xl font-bold text-white tracking-tight'>
            projeKt Rage
          </h1>
        </div>

        <form onSubmit={onSubmit} className='flex flex-col my-4'>
          <div>
            <Controller
              name='email'
              control={control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  eyebrow='E-mail'
                  type='email'
                  placeholder='seu@email.com'
                  disabled={loading}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  hint={formState.errors.email?.message ?? undefined}
                  state={formState.errors.email ? 'error' : 'default'}
                />
              )}
            />
          </div>

          <div className='mt-4 mb-8'>
            <Controller
              name='password'
              control={control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  eyebrow='Senha'
                  type='password'
                  placeholder='•••••••••'
                  disabled={loading}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  hint={formState.errors.password?.message ?? undefined}
                  state={formState.errors.password ? 'error' : 'default'}
                />
              )}
            />
          </div>

          <GenericButton
            type='submit'
            layout='outline'
            loading={loading}
            disabled={isDisabled}
          >
            Entrar
          </GenericButton>
        </form>

        <Link href='/register' className='block mt-4' tabIndex={-1}>
          <GenericButton disabled={loading} tabIndex={0}>
            Criar conta
          </GenericButton>
        </Link>

        <div className='text-center mt-8'>
          <CopyRight />
        </div>
      </motion.div>
    </main>
  );
}
