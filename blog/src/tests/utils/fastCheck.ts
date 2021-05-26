import fc, { Arbitrary, Parameters } from 'fast-check';
import { DocumentNode } from 'graphql';
import { cExpect, expectArgumentTypeOrValidationError } from '.';
import { NAME_MAX_CHARS, NAME_MIN_CHARS } from '../../constants/validation';

type FCGeneratedValue = string | number | null | undefined | boolean;
export type FCGenerator = Arbitrary<FCGeneratedValue>;

export interface FCInputGenerator<FieldNames> {
  property: FieldNames;
  generators: FCGenerator;
}

interface FCAlphaStringOptions extends fc.StringSharedConstraints {
  isOptional?: boolean;
  includeUpperCase?: boolean;
}

interface FCTestForInvalidInputsOpts<FieldNames> {
  validInputGenerators: FCInputGenerator<FieldNames>[];
  invalidInputGenerators: FCInputGenerator<FieldNames>[];
  isAsync?: boolean;
  testFunc: (generatedValues: FCGeneratedValue[]) => Promise<void> | void;
  assertParams?: Pick<Parameters<unknown>, 'numRuns' | 'examples'>;
}

interface FCTestForGraphqlInvalidInputsOpts<PropertyNames>
  extends Pick<
    FCTestForInvalidInputsOpts<PropertyNames>,
    'validInputGenerators' | 'invalidInputGenerators' | 'assertParams'
  > {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tester: any;
  resolver: DocumentNode;
  resolverArgumentName?: string;
  context?: { [key: string]: unknown };
}

export const UPPER_CASE_ALPHABETS_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const LOWER_CASE_ALPHABETS_STR = 'abcdefghijklmnopqrstuvwxyz';
export const NUMBERS_STR = '1234567890';

function falsy(isOptional = false): FCGenerator {
  return fc
    .falsy()
    .filter((val) => (isOptional ? val !== undefined && val !== null : true));
}

// --------- INPUT GENERATORS START ---------
/**
 *
 * @param isOptional If set to true, will not generate null and undefined
 */
export function fcInvalidEmailInputGenerators(isOptional = false): FCGenerator {
  return fc.oneof(
    falsy(isOptional),
    fc.stringOf(
      fc.constantFrom(...UPPER_CASE_ALPHABETS_STR, ...NUMBERS_STR, '@'),
    ),
  );
}

/**
 * Generate invalid stings containing special chars or numbers.
 * @param isOptional If set to true, will not generate null and undefined
 */
export function fcInvalidNameInputGenerators(isOptional = false): FCGenerator {
  return fc.oneof(
    falsy(isOptional),
    // Break grammar of `NAME_REG_EXP`
    fc.stringOf(fc.constantFrom('1', '#', 'a1', '.', "J.r'", ' .', "'.", "' ")),
    fc.stringOf(
      fc.constantFrom(
        ...LOWER_CASE_ALPHABETS_STR.substr(1, 5),
        ...UPPER_CASE_ALPHABETS_STR.substr(1, 5),
      ),
      {
        maxLength: NAME_MIN_CHARS - 1,
      },
    ),
    fc.stringOf(
      fc.constantFrom(
        ...LOWER_CASE_ALPHABETS_STR.substr(1, 5),
        ...UPPER_CASE_ALPHABETS_STR.substr(1, 5),
      ),
      {
        minLength: NAME_MAX_CHARS + 1,
      },
    ),
  );
}

/**
 * For generate strings using the characters produced by alphabets
 * @param options
 * @param {Boolean} options.isOptional Will generate undefined and null if true
 * @param {Boolean} options.includeUpperCase Generated string will have capital alphabets
 * @param {Number} options.minLength   Minimum length for the generated strings
 * @param {Number} options.isOptional  Maximum length for the generated strings
 */
export function fcAlphaString(options: FCAlphaStringOptions): FCGenerator {
  let charArr = LOWER_CASE_ALPHABETS_STR;
  if (options.includeUpperCase) {
    charArr += UPPER_CASE_ALPHABETS_STR;
  }

  const generators: FCGenerator[] = [
    fc.stringOf(fc.constantFrom(...charArr), {
      minLength: options.minLength,
      maxLength: options.maxLength,
    }),
  ];

  if (options.isOptional) {
    generators.push(fc.constantFrom(undefined, null));
  }
  return fc.oneof(...generators);
}

// --------- INPUT GENERATORS END ---------

function generateInvalidCombinations<FieldNames>(
  validInputGenerators: FCInputGenerator<FieldNames>[],
  invalidInputGenerators: FCInputGenerator<FieldNames>[],
) {
  if (validInputGenerators.length !== invalidInputGenerators.length) {
    throw new Error('Input generators should be of equal length');
  }

  const combinations: FCGenerator[][] = [];
  for (let i = 0; i < validInputGenerators.length; i += 1) {
    if (
      validInputGenerators[i].property !== invalidInputGenerators[i].property
    ) {
      throw new Error(`Property names on position ${i} don't match`);
    }

    combinations[i] = validInputGenerators.map((input) => input.generators);
    combinations[i][i] = invalidInputGenerators[i].generators; // add invalid input generator at index i
  }

  return combinations;
}

/**
 * Note: Generated values will be in same order of properties specified in valid/invalid input generators
 */
export async function fcTestForInvalidInputs<FieldNames extends string>(
  args: FCTestForInvalidInputsOpts<FieldNames>,
): Promise<void> {
  const {
    validInputGenerators,
    invalidInputGenerators,
    isAsync,
    testFunc,
    assertParams,
  } = args;

  const combinations = generateInvalidCombinations(
    validInputGenerators,
    invalidInputGenerators,
  );

  await Promise.all(
    combinations.map(async (generators) =>
      fc.assert(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (isAsync ? fc.asyncProperty : fc.property)(
          ...generators,
          (...generatedValues: FCGeneratedValue[]) => testFunc(generatedValues),
        ),
        { numRuns: 50, ...(assertParams || {}) },
      ),
    ),
  );
}

export async function fcTestForGraphqlInvalidInputs<FieldNames extends string>({
  tester,
  resolver,
  resolverArgumentName,
  context,
  invalidInputGenerators,
  validInputGenerators,
  assertParams,
}: FCTestForGraphqlInvalidInputsOpts<FieldNames>): Promise<void> {
  const inputsUsed: unknown[] = [];
  async function testerFunc(generatedValues: FCGeneratedValue[]) {
    const input: { [key: string]: unknown } = {};

    validInputGenerators.forEach((_generator, index) => {
      input[_generator.property] = generatedValues[index];
    });

    const { data, errors } = await tester.graphql(
      resolver,
      undefined,
      context,
      resolverArgumentName ? { [resolverArgumentName]: input } : { ...input },
    );
    cExpect(!data, JSON.stringify({ data, input })).to.be.true;
    expectArgumentTypeOrValidationError(errors);
    inputsUsed.push(input);
  }

  await fcTestForInvalidInputs({
    validInputGenerators,
    invalidInputGenerators,
    isAsync: true,
    testFunc: testerFunc,
    assertParams,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const operationName = (resolver as any).definitions?.[0]?.selectionSet
  //   ?.selections?.[0]?.name?.value;

  // console.info(
  //   `Sample inputs used for operation: ${operationName}`,
  //   faker.random.arrayElements(inputsUsed, 5),
  // );
}
