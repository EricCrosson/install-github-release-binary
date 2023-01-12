export type Err = { tag: "error"; errors: string[] };
export type Ok<A> = { tag: "ok"; value: A };
export type Either<A> = Ok<A> | Err;

export function error<A>(errors: string[]): Either<A> {
  return { tag: "error", errors };
}

export function ok<A>(value: A): Either<A> {
  return { tag: "ok", value };
}

export function isErr<A>(value: Either<A>): value is Err {
  return value.tag === "error";
}

export function isOk<A>(value: Either<A>): value is Ok<A> {
  return value.tag === "ok";
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
