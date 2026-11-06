import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Tanpa `globals: true`, Testing Library tidak membersihkan DOM sendiri antar tes.
afterEach(() => cleanup())
