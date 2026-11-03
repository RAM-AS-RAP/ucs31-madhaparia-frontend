const badCharacters = /[\p{Cc}\p{Cs}]/u

export function normaliseFullName(value) {
  return value.trim().replace(/\s+/gu, ' ')
}

export function normalisePhoneNumber(value) {
  return value.replace(/[\s().-]/gu, '')
}

export function validateProfile(fullName, phoneNumber = '') {
  const errors = {}
  const name = normaliseFullName(fullName)
  const phone = normalisePhoneNumber(phoneNumber)

  if (
    badCharacters.test(fullName) ||
    [...name].length < 2 ||
    [...name].length > 100 ||
    !/\p{L}/u.test(name)
  ) {
    errors.fullName = 'nameError'
  }

  if (
    phoneNumber.length > 64 ||
    badCharacters.test(phoneNumber) ||
    (phone && !/^\+[1-9][0-9]{7,14}$/.test(phone))
  ) {
    errors.phoneNumber = 'phoneError'
  }

  return errors
}

export function profilePayload(fullName, phoneNumber) {
  return {
    full_name: normaliseFullName(fullName),
    phone_number: normalisePhoneNumber(phoneNumber) || null,
  }
}

export function validRegistrationPassword(password) {
  const length = [...password].length

  return (
    length >= 8 &&
    length <= 128 &&
    password.trim().length > 0
  )
}

export function validateRegistration(values) {
  const errors = validateProfile(
    values.fullName,
    values.phoneNumber,
  )

  const email = values.email.trim()

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = 'emailError'
  }

  if (!validRegistrationPassword(values.password)) {
    errors.password = 'passwordError'
  }

  if (
    !values.confirmPassword ||
    values.confirmPassword !== values.password
  ) {
    errors.confirmPassword = 'confirmError'
  }

  return errors
}

export function passwordStrength(password) {
  if (!password) return 0

  const common = new Set([
    'password',
    'password123',
    '12345678',
    '123456789',
    'qwerty123',
  ])

  if (
    !validRegistrationPassword(password) ||
    common.has(password.toLowerCase()) ||
    /^(.)\1+$/u.test(password)
  ) {
    return 1
  }

  if ([...password].length >= 16) return 3

  return 2
}