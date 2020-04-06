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
  while (!(await driver.hasElementByAccessibilityId('ID'))) {
    await driver.sleep(5000);
  }
});
test('Login', async () => {
  await driver.elementByAccessibilityId('ID').sendKeys('1111111111111');
  await driver.elementByAccessibilityId('password').sendKeys('1234');
  await driver.elementByAccessibilityId('conPassword').sendKeys('1234');
  await driver.elementByAccessibilityId('fName').sendKeys('Rimuru');
  await driver.elementByAccessibilityId('lName').sendKeys('Tempest');
  expect(await driver.hasElementByAccessibilityId('login')).toBe(true);
  const element = await driver.elementByAccessibilityId('login');
  await element.click();
});

test('Add Hospital', async () => {
  while (!(await driver.hasElementByAccessibilityId('add_hospital'))) {
    await driver.sleep(3000);
  }
  const element = await driver.elementByAccessibilityId('add_hospital');
  await element.click();

  while (!(await driver.hasElementByAccessibilityId('next_hospitalQR'))) {
    await driver.sleep(3000);
  }
  const element1 = await driver.elementByAccessibilityId('next_hospitalQR');
  await element1.click();

  while (!(await driver.hasElementByAccessibilityId('add_hospitalScan'))) {
    await driver.sleep(3000);
  }
  const element2 = await driver.elementByAccessibilityId('add_hospitalScan');
  await element2.click();

  while (!(await driver.hasElementByAccessibilityId('add_hospital'))) {
    await driver.sleep(3000);
  }
  expect(await driver.hasElementByAccessibilityId('Siriraj Hospital')).toBe(
    true,
  );
});
