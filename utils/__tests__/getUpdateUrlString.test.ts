import { getUpdateUrlString } from 'frontendReact/hooks/useUrlSync/v1.0/utils/getUpdateUrlString';
import { formatDate, parseDate } from 'frontendReact/utils/dates/dates';

test('Returns proper object with renamed URL params and converters', () => {
  const result = getUpdateUrlString(
    {
      formField1: 'field1Value',
      formField2: parseDate('1988-06-30'),
      formField3: 'filterName_desc',
    },
    {
      formField2: (val: Date) => {
        return formatDate(val);
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

  expect(result).toBe(
    '/?form-field-1=field1Value&form-field-2=1988-06-30&form-field-3=filterName_desc'
  );
});

test('With converters, but no mappers passed', () => {
  const result = getUpdateUrlString(
    {
      formField1: 'field1Value',
      formField2: parseDate('1988-05-30'),
      formField3: 'filterName_desc',
    },
    {
      formField2: (val: Date) => {
        return formatDate(val);
      },
      formField3: (val) => {
        return val;
      },
    }
  );

  expect(result).toBe('/?formField1=field1Value&formField2=1988-05-30&formField3=filterName_desc');
});

test('With mappers, but no converters passed', () => {
  const result = getUpdateUrlString(
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

  expect(result).toBe(
    '/?form-field-1=field1Value&form-field-2=2012-01-30&form-field-3=filterName_desc'
  );
});

test('Without converters and mappers passed', () => {
  const result = getUpdateUrlString({
    formField1: 'field1Value',
    formField2: 'blabla',
    formField3: 'filterName_desc',
  });

  expect(result).toBe('/?formField1=field1Value&formField2=blabla&formField3=filterName_desc');
});

test('Without replacing existing get params in URL', () => {
  const setLocation = () => {
    delete window.location;
    // @ts-ignore
    window.location = {
      pathname: '/test-overwritten-pathname/',
      search: '?a=1&b=2&c[]=3&c[]=4',
    };
  };

  setLocation();

  const result = getUpdateUrlString(
    {
      a: '2',
    },
    undefined,
    undefined,
    false
  );

  // So we see that b anc c are not removed, just 'a' is changed from 1 to 2
  expect(result).toBe('/test-overwritten-pathname/?a=2&b=2&c[]=3&c[]=4');
});
