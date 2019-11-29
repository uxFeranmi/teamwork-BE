/* eslint-disable no-console */
const request = require('request');
const fs = require('fs');
const path = require('path');

const { TEST_USER_TOKEN: userToken } = require('../../constants/constants');

const { PORT = 4000, HOST = 'localhost' } = require('../../constants/constants');
const server = require('../../server'); 

const baseUrl = `http://${HOST}:${PORT}`;

const formData = {
  // Pass a simple key-value pair
  title: 'Sample Gif upload.',
  // Pass data via Streams
  file: fs.createReadStream(path.join(__dirname, 'sample1.gif')),
};

const reqOptions = {
  baseUrl,
  uri: '/gifs',
  method: 'POST',
  formData,
  headers: {
    token: userToken,
  },
};

const reqOptionsBadAuth = {
  ...reqOptions,
  headers: {
    token: 'invalid token',
  },
};

const reqOptionsNoFile = {
  ...reqOptions,
  formData: {
    ...formData,
    file: '',
  },
};

const reqOptionsWrongFile = {
  ...reqOptions,
  formData: {  
    ...formData,
    file: fs.createReadStream(path.join(__dirname, 'sample2.unsupported.png')),
  },
};

describe('POST /gifs', () => {
  beforeAll(() => {
    if (!server.listening) {
      server.listen(PORT, () => console.log(`Server is running.. on Port ${PORT}`));
    }
    console.log('\nPOST /gifs');
  });
  
  beforeEach(async () => {
    console.log('\n  ', 'Next Spec');
  });

  it('should upload gif to cloudinary and respond with image url', (done) => {
    request(reqOptions, (error, res, rawBody) => {
      console.log(error || '');
      const body = JSON.parse(rawBody);
      console.log('response body', body);
      expect(res.statusCode).toBe(201);
      expect(body.status).toBe('success');
      expect(body.data.gifId).toBeDefined();
      expect(body.data.imageUrl).toBeDefined();
      expect(body.data.createdOn).toBeDefined();
      expect(body.data.title).toBeDefined();
      expect(body.data.message).toBe('GIF image successfully posted');
      done();
    });
  });

  it('should respond with error (400) given unsupported image type', (done) => {
    request(reqOptionsWrongFile, (error, res, rawBody) => {
      console.log(error || '');
      const body = JSON.parse(rawBody);
      console.log('response body', body);
      expect(res.statusCode).toBe(400);
      expect(body.status).toBe('error');
      expect(body.error).toBeDefined();
      done();
    });
  });

  it('should respond with error (400) if no file is supplied', (done) => {
    request(reqOptionsNoFile, (error, res, rawBody) => {
      console.log(error || '');
      const body = JSON.parse(rawBody);
      console.log('response body', body);
      expect(res.statusCode).toBe(400);
      expect(body.status).toBe('error');
      expect(body.error).toBeDefined();
      done();
    });
  });

  it('should respond with error (403) for an unrecognized user (invalid token)', (done) => {
    request(reqOptionsBadAuth, (error, res, rawBody) => {
      console.log(error || '');
      const body = JSON.parse(rawBody);
      console.log('response body', body);
      expect(res.statusCode).toBe(403);
      expect(body.status).toBe('error');
      expect(body.error).toBeDefined();
      done();
    });
  });
});
