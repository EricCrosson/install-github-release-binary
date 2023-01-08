export type Option<A> = { tag: "none" } | { tag: "some"; value: A };

export function none<A>(): Option<A> {
  return { tag: "none" };
}

export function some<A>(value: A): Option<A> {
  return { tag: "some", value };
}

export function isEqual<A>(value: Option<A>, to: A): boolean {
  if (value.tag === "none") {
    return false;
  }
  return value.value === to;
}
