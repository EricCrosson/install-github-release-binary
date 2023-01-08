export type Either<A> =
  | { tag: "error"; errors: string[] }
  | { tag: "ok"; value: A };

export function error<A>(errors: string[]): Either<A> {
  return { tag: "error", errors };
}

export function ok<A>(value: A): Either<A> {
  return { tag: "ok", value };
}

export function unwrap<A>(either: Either<A>): A {
  if (either.tag === "error") {
    throw new Error(
      `Expected either to be 'ok', but got error: ${either.errors}`
    );
  }
  return either.value;
}

export function getErrors(either: Either<unknown>): string[] {
  if (either.tag === "ok") {
    return [];
  }
  return either.errors;
}
