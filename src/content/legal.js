// Supply the details intended for public display before publishing.
// Additional information may be needed depending on the site's activities.
export const imprint = {
  name: 'Jamie Scheer',
  address: ['Suhrenkamp 34', '22335 Hamburg', 'Germany'],
  email: 'contact@jamiescheer.de',
  additionalInformation: [],
};
export const imprintComplete = Boolean(imprint.name && imprint.address.length && imprint.email);
