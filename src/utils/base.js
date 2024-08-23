import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import validator from 'validator';

dayjs.extend(relativeTime);
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

export const removeScriptTags = text => {
  while (SCRIPT_REGEX.test(text)) {
    text = text.replace(SCRIPT_REGEX, '');
  }
  return text;
};

export const addZero = value => ('0' + value).slice(-2);

export const formatDate = value => {
  if (value) {
    const dt = new Date(value);
    return `${dt.getFullYear()}/${addZero(dt.getMonth() + 1)}/${addZero(dt.getDate())}`;
  }
  return '';
};

export const isBlank = str => {
  return !str || !str.trim();
};

export const readableTimestamp = ts => dayjs(ts).fromNow();

export const isEmail = email => {
  return validator.isEmail(email);
};

export const getCurrentTimestampInMs = () => {
  return new Date().getTime();
};

export const genId = () => {
  return getCurrentTimestampInMs();
};
