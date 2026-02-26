'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { CopyRight, GenericButton, IconButton } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { STEPS } from '@/constants';

interface OnboardingFormData {
  steps: string[];
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { setOnboarding } = useAuthStore();

  const { watch, setValue, handleSubmit } = useForm<OnboardingFormData>({
    defaultValues: {
      steps: [],
    },
  });

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const progress = (step / STEPS.length) * 100;
  const stepsValues = watch('steps');
  const currentSelected = stepsValues[step] || null;

  function onSelect(value: string) {
    let newSteps = [...stepsValues];
    if (currentSelected) newSteps[step] = value;
    else newSteps = [...newSteps, value];

    setValue('steps', newSteps);
  }

  function onGoBack() {
    if (isFirst) return;

    setStep(s => s - 1);
  }

  async function onNext() {
    if (!currentSelected) return;

    setStep(s => s + 1);
  }

  const onSubmit = handleSubmit(async data => {
    setLoading(true);

    const [capital, experience, goal] = data.steps;

    setOnboarding({
      capital,
      experience,
      goal,
    });

    if (data.steps.length > 0) {
      await new Promise(r => setTimeout(r, 1000));
    }

    router.push('/dashboard');
    setLoading(false);
  });

  const renderCards = useMemo(
    () =>
      current.options.map(option => {
        const isSelected = stepsValues.includes(option.value);

        return (
          <button
            type='button'
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-4 rounded-lg border transition-all duration-300 focus:outline-none active:scale-[0.98] group ${
              isSelected
                ? 'bg-white text-black border-white hover:bg-neutral-200 disabled:bg-neutral-200 focus:ring-1 focus:ring-white'
                : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800 disabled:bg-neutral-800 focus:ring-1 focus:ring-neutral-900'
            }`}
            disabled={loading}
          >
            <div className='flex items-center justify-between'>
              <span className='text-sm text-left font-medium'>
                {option.label}
              </span>
              <span
                className={`text-sm text-right font-mono ${isSelected ? 'text-neutral-900 hover:text-neutral-800' : 'text-neutral-500 hover:text-neutral-400'}`}
              >
                {option.hint}
              </span>
            </div>
          </button>
        );
      }),
    [current, loading, stepsValues],
  );

  return (
    <main className='min-h-screen w-full flex flex-col items-center justify-center bg-black px-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-8 relative z-10'
      >
        <AnimatePresence mode='wait'>
          {!isFirst && (
            <motion.div
              key='go-back'
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className='absolute top-7 left-7'
            >
              <IconButton
                name='arrow-left'
                disabled={loading}
                onClick={onGoBack}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className='flex flex-col items-center gap-2 mb-8'>
          <Image
            src='/logo-circle.png'
            alt='projeKt Rage logo'
            width={48}
            height={48}
            className='size-12'
          />

          <h1 className='text-2xl font-bold text-white tracking-tight'>
            Onboarding
          </h1>
        </div>

        <div className='mb-8'>
          <p className='text-xs uppercase tracking-wider text-gray-600 mb-2 text-center'>
            {step + 1} de {STEPS.length}
          </p>

          <div className='w-full h-2 bg-white/10 rounded-lg overflow-hidden mb-6'>
            <motion.div
              key='progress'
              initial={{ width: `${progress}%` }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className={`h-full bg-white rounded-lg shadow-lg ${loading ? 'bg-neutral-200' : 'bg-white'}`}
            />
          </div>

          <div className='mb-6 min-h-[2.5em]'>
            <AnimatePresence mode='wait'>
              <motion.h2
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className='text-xl text-white text-center'
              >
                {current.question}
              </motion.h2>
            </AnimatePresence>
          </div>

          <div className='space-y-3'>{renderCards}</div>
        </div>

        <GenericButton
          layout='outline'
          loading={loading}
          disabled={!currentSelected || loading}
          onClick={isLast ? onSubmit : onNext}
        >
          {isLast ? 'Concluir' : 'Avançar'}
        </GenericButton>

        <GenericButton
          layout='ghost'
          className='mt-4'
          disabled={loading}
          onClick={onSubmit}
        >
          Pular
        </GenericButton>

        <div className='text-center mt-8'>
          <CopyRight />
        </div>
      </motion.div>
    </main>
  );
}
