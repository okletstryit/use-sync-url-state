import { getNewBrowserUrlParamsObj } from '../getNewBrowserUrlParamsObj';
import { parseDate } from 'frontendReact/utils/dates/dates';

test('Returns proper object with renamed URL params and converters', () => {
  const result = getNewBrowserUrlParamsObj(
    {
      formField1: 'field1Value',
      formField2: parseDate('1988-06-30'),
      formField3: 'filterName_desc',
    },
    {
      formField2: (val: Date) => {
        return `${val.getDate()}-${val.getMonth()}-${val.getFullYear()}`;
      },
      formField3: (val) => {
        return val;
      },
    },
    {
      formField1: 'form-field-1',
      formField2: 'form-field-2',
      formField3: 'form-field-3',
    }
  );

  expect(result).toMatchObject({
    'form-field-1': 'field1Value',
    'form-field-2': '30-5-1988',
    'form-field-3': 'filterName_desc',
  });
});

test('With converters, but no mappers passed', () => {
  const result = getNewBrowserUrlParamsObj(
    {
      formField1: 'field1Value',
      formField2: parseDate('1988-06-30'),
      formField3: 'filterName_desc',
    },
    {
      formField2: (val: Date) => {
        return `${val.getDate()}-${val.getMonth()}-${val.getFullYear()}`;
      },
      formField3: (val) => {
        return val;
      },
    }
  );

  expect(result).toMatchObject({
    formField1: 'field1Value',
    formField2: '30-5-1988',
    formField3: 'filterName_desc',
  });
});

test('With mappers, but no converters passed', () => {
  const result = getNewBrowserUrlParamsObj(
    {
      formField1: 'field1Value',
      formField2: '2012-01-30',
      formField3: 'filterName_desc',
    },
    undefined,
    {
      formField1: 'form-field-1',
      formField2: 'form-field-2',
      formField3: 'form-field-3',
    }
  );

  expect(result).toMatchObject({
    'form-field-1': 'field1Value',
    'form-field-2': '2012-01-30',
    'form-field-3': 'filterName_desc',
  });
});

test('Without converters and mappers passed', () => {
  const result = getNewBrowserUrlParamsObj({
    formField1: 'field1Value',
    formField2: 'blabla',
    formField3: 'filterName_desc',
  });

  expect(result).toMatchObject({
    formField1: 'field1Value',
    formField2: 'blabla',
    formField3: 'filterName_desc',
  });
});
