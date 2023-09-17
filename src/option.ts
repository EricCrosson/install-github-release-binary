export type None = { tag: "none" };
export type Some<A> = { tag: "some"; value: A };
export type Option<A> = Some<A> | None;

export function none<A>(): Option<A> {
  return { tag: "none" };
}

export function some<A>(value: A): Option<A> {
  return { tag: "some", value };
}

export function isNone<A>(value: Option<A>): value is None {
  return value.tag === "none";
}

export function isSome<A>(value: Option<A>): value is Some<A> {
  return value.tag === "some";
}

export function isEqual<A>(value: Option<A>, to: A): boolean {
  if (value.tag === "none") {
    return false;
  }
  return value.value === to;
}

export function unwrapOrDefault<A>(value: Option<A>, orElse: A): A {
  if (value.tag === "some") {
    return value.value;
  }
  return orElse;
}
