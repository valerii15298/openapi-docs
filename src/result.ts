export const Ok = <T>(ok: T) => ({ isOk: true, ok }) as const;
type Ok<T> = ReturnType<typeof Ok<T>>;

export const Err = <T>(err: T) => ({ isOk: false, err }) as const;
type Err<T> = ReturnType<typeof Err<T>>;

export type Result<TOk, TErr> = Ok<TOk> | Err<TErr>;

function catchAs<TErr>() {
  function tryCatch<TOk>(fn: () => TOk): Result<TOk, TErr> {
    try {
      return Ok(fn());
    } catch (err) {
      return Err(err as TErr);
    }
  }
  return { try: tryCatch };
}

function tryCatch<TOk>(fn: () => TOk): Result<TOk, unknown> {
  try {
    return Ok(fn());
  } catch (err) {
    return Err(err);
  }
}

function catchError<TOk>(fn: () => TOk): Result<TOk, Error> {
  try {
    return Ok(fn());
  } catch (err) {
    return Err(err instanceof Error ? err : new Error(String(err)));
  }
}

export const Result = { Ok, Err, try: tryCatch, catch: catchAs, catchError };
