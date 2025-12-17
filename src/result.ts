export const Ok = <T>(ok: T) => ({ isOk: true, ok }) as const;
type Ok<T> = ReturnType<typeof Ok<T>>;

export const Err = <T>(err: T) => ({ isOk: false, err }) as const;
type Err<T> = ReturnType<typeof Err<T>>;

export type Result<TOk, TErr> = Ok<TOk> | Err<TErr>;

/**
 * Create a catcher that treats thrown values as a specific error payload type.
 *
 * @template TErr - The type to cast caught exceptions to.
 * @returns An object with a `try` method that executes a function and returns `Ok(result)` on success or `Err(err as TErr)` when an exception is thrown.
 */
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

/**
 * Execute a synchronous function and wrap its outcome in a Result.
 *
 * @param fn - Function to invoke
 * @returns `Ok` containing the function's return value if invocation succeeds, `Err` containing the thrown value otherwise
 */
function tryCatch<TOk>(fn: () => TOk): Result<TOk, unknown> {
  try {
    return Ok(fn());
  } catch (err) {
    return Err(err);
  }
}

/**
 * Execute `fn` and wrap its outcome in a Result, normalizing thrown values to `Error`.
 *
 * If `fn` throws a non-`Error` value, that value is converted to an `Error` using its string representation.
 *
 * @param fn - The function to execute and wrap
 * @returns `Ok` containing the function's return value on success, or `Err` containing an `Error` on failure
 */
function catchError<TOk>(fn: () => TOk): Result<TOk, Error> {
  try {
    return Ok(fn());
  } catch (err) {
    return Err(err instanceof Error ? err : new Error(String(err)));
  }
}

export const Result = { Ok, Err, try: tryCatch, catch: catchAs, catchError };