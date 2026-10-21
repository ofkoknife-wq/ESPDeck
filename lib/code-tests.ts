import type { CodeTest } from './advanced-types'

export function runCodeTests(src: string, tests: CodeTest[]) {
  return tests.map((test) => {
    const includes = (test.includes ?? []).every((needle) => src.includes(needle))
    const regex = test.regex ? new RegExp(test.regex).test(src) : true
    return { name: test.name, ok: includes && regex }
  })
}

export function testsPassed(src: string, tests: CodeTest[]) {
  return runCodeTests(src, tests).every((result) => result.ok)
}
