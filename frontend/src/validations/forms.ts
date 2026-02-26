import * as yup from 'yup';

export const hasUpperCase = /[A-Z]/; // don't use /g
export const hasLowerCase = /[a-z]/; // don't use /g
export const hasNumbers = /\d/; // don't use /g
export const hasAlphas = /\W/; // don't use /g

export const email = yup
  .string()
  .required('O e-mail é obrigatório.')
  .email('E-mail inválido.');

export const fullname = yup
  .string()
  .required('O nome é obrigatório')
  .transform(value => value?.trim().replace(/\s+/g, ' ') || '')
  .test('is-full-name', 'Digite o nome completo', value => {
    if (!value) return false;
    const words = value?.trim()?.split(' ');
    return words?.length >= 2 && words?.every(w => w?.length >= 2);
  })
  .matches(/^[A-Za-zÀ-ÿ\s'-]+$/, 'O nome deve conter apenas letras');

export const password = yup
  .string()
  .required('A senha é obrigatória.')
  .matches(hasUpperCase, 'A senha deve conter pelo menos uma letra maiúscula')
  .matches(hasLowerCase, 'A senha deve conter pelo menos uma letra minúscula')
  .matches(hasNumbers, 'A senha deve conter pelo menos um número')
  .matches(hasAlphas, 'A senha deve conter pelo menos um caracter especial')
  .min(8, 'A senha deve conter pelo menos 8 caracteres');

export const passwords = {
  password,
  passwordConfirm: yup
    .string()
    .required('A senha é obrigatória.')
    .oneOf([yup.ref('password')], 'As senhas não coincidem.'),
};
