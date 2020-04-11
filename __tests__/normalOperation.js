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
  expect(await driver.hasElementByAccessibilityId('login')).toBe(true);
  expect(await driver.elementByAccessibilityId('login').isEnabled()).toBe(
    false,
  );
  await driver.elementByAccessibilityId('ID').sendKeys('1111111111111');
  expect(await driver.elementByAccessibilityId('login').isEnabled()).toBe(
    false,
  );
  await driver.elementByAccessibilityId('password').sendKeys('12345678');
  expect(await driver.elementByAccessibilityId('login').isEnabled()).toBe(
    false,
  );
  await driver.elementByAccessibilityId('conPassword').sendKeys('12345678');
  expect(await driver.elementByAccessibilityId('login').isEnabled()).toBe(
    false,
  );
  await driver.elementByAccessibilityId('fName').sendKeys('Rimuru');
  expect(await driver.elementByAccessibilityId('login').isEnabled()).toBe(
    false,
  );
  await driver.elementByAccessibilityId('lName').sendKeys('Tempest');
  expect(await driver.elementByAccessibilityId('login').isEnabled()).toBe(true);
  const element = await driver.elementByAccessibilityId('login');
  await element.click();
  while (!(await driver.hasElementByAccessibilityId('LabTesting_header'))) {
    await driver.sleep(3000);
  }
  await driver.sleep(1000);
  let action = new wd.TouchAction(driver);
  action
    .press({x: 1000, y: 500})
    .wait(1000)
    .moveTo({x: 100, y: 500})
    .release();
  await action.perform();
  while (!(await driver.hasElementByAccessibilityId('DrugAllergy_header'))) {
    await driver.sleep(3000);
  }
  await driver.sleep(1000);
  await action.perform();
  while (!(await driver.hasElementByAccessibilityId('DrugDispensing_header'))) {
    await driver.sleep(3000);
  }
  await driver.sleep(1000);
  await action.perform();
  console.debug('Login Ok.');
});

test('Add Hospital', async () => {
  /*
  let action = new wd.TouchAction(driver);
  action.press({x: 670, y: 1949}).release();
  await action.perform();
  */

  const hospitalTab_element = await driver.elementByAccessibilityId(
    'Hospital, tab, 3 of 4',
  );
  await hospitalTab_element.click();
  await driver.sleep(3000);
  while (!(await driver.hasElementByAccessibilityId('add_hospital'))) {
    await driver.sleep(1000);
  }
  const add_hospital_element = await driver.elementByAccessibilityId(
    'add_hospital',
  );
  await add_hospital_element.click();

  while (!(await driver.hasElementByAccessibilityId('next_hospitalQR'))) {
    await driver.sleep(1000);
  }
  const next_hospitalQR_element = await driver.elementByAccessibilityId(
    'next_hospitalQR',
  );
  await next_hospitalQR_element.click();
  while (!(await driver.hasElementByAccessibilityId('add_hospitalScan'))) {
    await driver.sleep(1000);
  }
  const name_hospitalScan_element = await driver.elementByAccessibilityId(
    'name_hospitalScan',
  );
  expect(await name_hospitalScan_element.getAttribute('text')).toBe(
    'Add Siriraj Hospital',
  );

  const endpoint_hospitalScan_element = await driver.elementByAccessibilityId(
    'endpoint_hospitalScan',
  );
  expect(await endpoint_hospitalScan_element.getAttribute('text')).toBe(
    'End point http://localhost:3001/api/',
  );

  const add_hospitalScan_element = await driver.elementByAccessibilityId(
    'add_hospitalScan',
  );
  await add_hospitalScan_element.click();

  while (!(await driver.hasElementByAccessibilityId('add_hospital'))) {
    await driver.sleep(1000);
  }
  expect(await driver.hasElementByAccessibilityId('Siriraj Hospital')).toBe(
    true,
  );
  const Siriraj_element = await driver.elementByAccessibilityId(
    'Siriraj Hospital',
  );
  await Siriraj_element.click();
  while (!(await driver.hasElementById('android:id/alertTitle'))) {
    await driver.sleep(1000);
  }
  const alertTitle_element = await driver.elementById('android:id/alertTitle');
  expect(await alertTitle_element.getAttribute('text')).toBe(
    'Siriraj Hospital',
  );
  const message_element = await driver.elementById('android:id/message');
  expect((await message_element.getAttribute('text')).split('\n')[1]).toBe(
    'Status : Enable',
  );
  const button3_element = await driver.elementById('android:id/button3');
  await button3_element.click();
  console.debug('Add Hospital Ok.');
});
