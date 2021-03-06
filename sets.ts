///////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////
function contains<T>(x: T): void {
}

contains<true>(true)
contains<false>(false)
contains<0>(0)
contains<'literal'>('literal')

///////////////////////////////////////////////////////////////////////////////

function assert<T extends true>(): void {
}

function doesNotTypecheck<T, G>(x: T extends infer U ? U extends G ? never : {} : {}): void {
}

doesNotTypecheck<{}, number>(343); // doesn't compile

doesNotTypecheck<{}, boolean>(343); // doesn't compile
doesNotTypecheck<boolean, number>(false); // compiles

assert<true>()
assert<false>() // won't typecheck

///////////////////////////////////////////////////////////////////////////////

// In languages with a structural type system, the top type is the empty structure. 
type Top = {} // ⊤ 
type Bottom = never // ⊥

let TOP: Top
let BOTTOM: Bottom

contains<Top>('literally everything')

contains<Bottom>(null) 
contains<Bottom>(undefined)

///////////////////////////////////////////////////////////////////////////////
// SET OPERATIONS
///////////////////////////////////////////////////////////////////////////////

// extends is equivalent to the ⊂ operator
assert<1 extends (1 | 2) ? true : false>();
assert<1 extends (2) ? true : false>();

type BadSubset<A, B> = A extends B ? true : false

contains<BadSubset<2 | 3, 3>>(true)
contains<BadSubset<2 | 3, 3>>(false)
// wat
//  BadSubset<2 | 3, 3> is boolean!?

// This is because of "Distributive Conditional Types"

// Conditional types in which the checked type is a naked type parameter are called distributive conditional types. 
// Distributive conditional types are automatically distributed over union types during instantiation.

// `T extends U ? X : Y` with the type argument `A | B | C` for `T` is resolved as 
// `(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)`
// See as follows

// https://www.typescriptlang.org/docs/handbook/advanced-types.html
type TypeName<T> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends undefined ? "undefined" :
    T extends Function ? "function" :
    "object";

type TestTypeNameString   = TypeName<string>;  // "string"
type TestTypeNameA        = TypeName<"a">;  // "string"
type TestTypeNameBoolean  = TypeName<true>;  // "boolean"
type TestTypeNameFunction = TypeName<() => void>;  // "function"
type TestTypeNameObject   = TypeName<string[]>;  // "object"

// Here's where `TypeName` gets distributed over the union:
type TestTypeNameStringOrFunction = TypeName<string | (() => void)>;  // "string" | "function"
type TestTypeNameStringOrObjectOrUndefined = TypeName<string | string[] | undefined>;  // "string" | "object" | "undefined"
type TestTypeNameObject2 = TypeName<string[] | number[]>;  // "object"

// So `Subset<2 | 3, 3>` resolves to `boolean`, 
// because while 2 is not assignable to 3, 3 is assignable to 3, hence `false | true` aka `boolean`

type Subset<A, B> = [A] extends [B] ? true : false
// So we wrap our type arguments in lists so that they aren't "naked", because only _naked_ types are distrubted.

contains<Subset<2 | 3, 3>>(false)
contains<Subset<2 | 3, 3>>(true) // doesn't typecheck. As you can see, it now works!

assert<Subset<2 | 3, 1 | 2 | 3>>()
assert<Subset<string, 'asdf'>>()

const _stringIsSubsetOfAsdf: Subset<'asdf', string> = true

const _asdfListIsSubsetOfStringList: Subset<'asdf'[], string[]> = true
const _stringListIsSubsetOfAsdfList: Subset<string[], 'asdf'[]> = false

///////////////////////////////////////////////////////////////////////////////
// BOOLEANS
///////////////////////////////////////////////////////////////////////////////

type And<A, B> = true extends A & B ? true : false
type Or<A, B> = true extends A | B ? true : false

contains<And<true, true>>(true)
contains<And<true, false>>(false)
contains<And<false, true>>(false)
contains<And<false, false>>(false)

// type Equal<A, B> = true extends ([A] extends [B] ? true : false) & ([B] extends [A] ? true : false) ? true : false
type Equal<A, B> = And<Subset<A, B>, Subset<B, A>>

// type T12 = 1 | 2
// type T23 =     2 | 3

// type T2 = T12 & T23

// https://github.com/Microsoft/TypeScript/issues/9999 here be dragons, `any` is both ⊥ and ⊤, `{}` is the true ⊤ type

assert<Equal<1 | Top, Top>>()
assert<Equal<1 | Bottom, 1>>() 

assert<Equal<1 & Top, 1>>()
assert<Equal<1 & Bottom, Bottom>>()

// // { true }
// let _testTrueTrueIntersection: true & true = true
// _testTrueIntersection = false // doesn't typecheck


// let _testTrueFalseIntersection: true & false = BOTTOM
// _testTrueFalseIntersection = true // doesn't typecheck
// _testTrueFalseIntersection = false // doesn't typecheck

// const _isTrueIntersection: true extends true & true ? true : false = true
// const _isFalseIntersection: true extends true & false ? true : false = false

// const _testBooleanEquality: Equal<boolean, true | false> = true
// const _testIntersectionInequality: Equal<1 | 2, 2 | 3> = false

// #############################################################################
// Interfaces are equivalent to type functions

type StringToString<A extends string> = string

interface IStringToString {
    [a: string]: string
}

type StringToNumber<A extends string> = number

interface IStringToNumber {
    [a: string]: number
}

type StringToStringOrNumber<T extends string> = StringToString<T> | StringToNumber<T>

type IStringToStringOrNumber = IStringToNumber | IStringToString

let _stringOrNumber: IStringToStringOrNumber['arbitary parameter']
_stringOrNumber = 'string'
_stringOrNumber = 0

let _AlsoStringOrNumber: StringToStringOrNumber<'arbitary parameter'>
_AlsoStringOrNumber = 'string'
_AlsoStringOrNumber = 0

interface NumberCodec {
    0: 'zero',
    'zero': 0
}

const _zeroString: NumberCodec[0] = 'zero';
const _zeroNumber: NumberCodec['zero'] = 0
const _roundtrip:  NumberCodec[NumberCodec['zero']] = 'zero'

// https://www.typescriptlang.org/docs/handbook/advanced-types.html
type Unpacked<T> =
    T extends (infer U)[] ? U :
    T extends (...args: any[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;

type T0 = Unpacked<string>;  // string
type T1 = Unpacked<string[]>;  // string
type T2 = Unpacked<() => string>;  // string
type T3 = Unpacked<Promise<string>>;  // string
type T4 = Unpacked<Promise<string>[]>;  // Promise<string>
type T5 = Unpacked<Unpacked<Promise<string>[]>>;  // string

// https://wiki.haskell.org/Peano_numbers
type Z = { kind: 'zero' }
type S<T extends Nat> = { kind: 'succ', S: T };

type Nat = Z | { kind: 'succ', S: Nat };
//             ^ we can't write S<Nat> here because it would be a circular reference :(

type N1  = S<Z>;
type N2  = S<N1>;
type N3  = S<N2>;
type N4  = S<N3>;
type N5  = S<N4>;
type N6  = S<N5>;
type N7  = S<N6>;
type N8  = S<N7>;
type N9  = S<N8>;
type N10 = S<N9>;

// http://docs.idris-lang.org/en/latest/proofs/pluscomm.html#running-example-addition-of-natural-numbers
/**
 * plus : Nat -> Nat -> Nat
 * plus (S k) m = S (plus k m)
 * plus Z     m = m
*/
type Plus<X extends Nat, M extends Nat> =
    X extends S<infer K> 
        ? { kind: 'succ', S: Plus<K, M> } // recursive backreference in interface type, to subvert the fact we can't do S<Plus<K, M>> 
        : M;
// For more information about the backreference hack https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540`

assert<Equal<Plus<N4, N5>, N9>>();
assert<Equal<Plus<N1, N3>, N4>>();
assert<Equal<Plus<N1, N3>, N5>>(); // doesn't typecheck

// total mult : Nat -> Nat -> Nat
// mult Z right        = Z
// mult (S left) right = plus right $ mult left right
type Mult<X extends Nat, M extends Nat> =
  X extends S<infer K> 
    ? Plus<M, Mult<K, M>> 
    : Z;


const z: Z = 0;
function s<T extends Nat>(n: T): S<T> {
    return { S: n };
}

function isSucc(pet: Nat): pet is S<Nat> {
    return pet !== 0;
}


function plus<X extends Nat, M extends Nat>(x: X, m: M): Plus<X, M> {
    if (isSucc(x)) {
        const k = x.S; // k := x - 1

        // hmmm :/
        return s(plus(k, m)); 
    }

    return m;
}