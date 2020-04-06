import wd from 'wd';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
const PORT = 4723;
const config = {
  platformName: 'Android',
  deviceName: 'Pixel_3_API_29',
  app:
    '/media/kok/Data/react-native/StellarUI/android/app/build/outputs/apk/debug/app-debug.apk',
};
const driver = wd.promiseChainRemote('localhost', PORT);
jest.setTimeout(9999999);
beforeAll(async () => {
  await driver.init(config);
  await driver.sleep(30000);
});
test('my first appium test', async () => {
  await driver.elementByAccessibilityId('ID').sendKeys('1111111111111');
  await driver.elementByAccessibilityId('password').sendKeys('1234');
  await driver.elementByAccessibilityId('conPassword').sendKeys('1234');
  await driver.elementByAccessibilityId('fName').sendKeys('Rimuru');
  await driver.elementByAccessibilityId('lName').sendKeys('Tempest');
  expect(await driver.hasElementByAccessibilityId('login')).toBe(true);
  const element = await driver.elementByAccessibilityId('login');
  await element.click();
});
