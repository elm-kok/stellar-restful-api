import wd from 'wd';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
const PORT = 4723;
const config = {
  platformName: 'Android',
  deviceName: 'emulator-5554',
  avd: 'Pixel_3_API_29',
  uiautomator2ServerLaunchTimeout: 399999,
  androidInstallTimeout: 399999,
  uiautomator2ServerInstallTimeout: 399999,
  avdLaunchTimeout: 399999,
  avdReadyTimeout: 399999,
  adbExecTimeout: 399999,
  newCommandTimeout: 399999,
  app:
    '/media/kok/Data/react-native/Frontend/Patient/StellarUI/android/app/build/outputs/apk/debug/app-debug.apk',
};
const driver = wd.promiseChainRemote('localhost', PORT);
jest.setTimeout(9999999);

const toggleAction = new wd.TouchAction(driver);
toggleAction
  .press({x: 500, y: 500})
  .moveTo({x: 500, y: 1000})
  .release();

const swipeRightAction = new wd.TouchAction(driver);
swipeRightAction
  .press({x: 1000, y: 500})
  .wait(1000)
  .moveTo({x: 100, y: 500})
  .release();

describe('Patient-Doctor', () => {
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
    while (!(await driver.elementByAccessibilityId('login').isEnabled())) {
      await driver.sleep(3000);
    }
    const element = await driver.elementByAccessibilityId('login');
    await element.click();
    while (!(await driver.hasElementByAccessibilityId('LabTesting_header'))) {
      await driver.sleep(3000);
    }
    await driver.sleep(1000);

    await swipeRightAction.perform();
    while (!(await driver.hasElementByAccessibilityId('DrugAllergy_header'))) {
      await driver.sleep(3000);
    }
    await driver.sleep(1000);
    await swipeRightAction.perform();
    while (
      !(await driver.hasElementByAccessibilityId('DrugDispensing_header'))
    ) {
      await driver.sleep(3000);
    }
    await driver.sleep(1000);
    await swipeRightAction.perform();
    console.debug('Login Ok.');
  });
  test('Add Hospital', async () => {
    const hospitalTab_element = await driver.elementByAccessibilityId(
      'Hospital, tab, 3 of 4',
    );
    await hospitalTab_element.click();
    await driver.sleep(2000);
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

    //const next_hospitalQR_element = await driver.elementByAccessibilityId(
    //  'next_hospitalQR',
    //);
    //await next_hospitalQR_element.click();

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
    const alertTitle_element = await driver.elementById(
      'android:id/alertTitle',
    );
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
  test('Add Doctor', async () => {
    const DoctorTab_element = await driver.elementByAccessibilityId(
      'Doctor, tab, 2 of 4',
    );
    await DoctorTab_element.click();
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
    const add_doctor_element = await driver.elementByAccessibilityId(
      'add_Doctor',
    );
    await add_doctor_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_doctorScan'))) {
      await driver.sleep(1000);
    }
    const name_doctorScan_element = await driver.elementByAccessibilityId(
      'name_doctorScan',
    );
    expect(await name_doctorScan_element.getAttribute('text')).toBe(
      'Add Milim Nava',
    );

    const add_doctorScan_element = await driver.elementByAccessibilityId(
      'add_doctorScan',
    );
    await add_doctorScan_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Milim Nava')).toBe(true);
    const Milim_element = await driver.elementByAccessibilityId('Milim Nava');
    await Milim_element.click();

    while (!(await driver.hasElementById('android:id/alertTitle'))) {
      await driver.sleep(1000);
    }
    const alertTitle_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle_element.getAttribute('text')).toBe('Milim Nava');
    const message_element = await driver.elementById('android:id/message');
    expect((await message_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Enable',
    );
    const button3_element = await driver.elementById('android:id/button3');
    await button3_element.click();
    console.debug('Add Doctor Ok.');

    const settingsTab_element = await driver.elementByAccessibilityId(
      'Settings, tab, 4 of 4',
    );
    await settingsTab_element.click();
    console.debug('Click Doctor Tab to continue testing.');
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
  });
  test('Disable Doctor', async () => {
    const doctorTab_element = await driver.elementByAccessibilityId(
      'Doctor, tab, 2 of 4',
    );
    await doctorTab_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Milim Nava')).toBe(true);
    const Milim_element = await driver.elementByAccessibilityId('Milim Nava');
    await Milim_element.click();

    while (!(await driver.hasElementById('android:id/alertTitle'))) {
      await driver.sleep(1000);
    }
    const alertTitle_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle_element.getAttribute('text')).toBe('Milim Nava');
    const message_element = await driver.elementById('android:id/message');
    expect((await message_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Enable',
    );
    const button1_element = await driver.elementById('android:id/button1');
    await button1_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }

    await Milim_element.click();
    while (!(await driver.hasElementById('android:id/alertTitle'))) {
      await driver.sleep(1000);
    }
    const alertTitle2_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle2_element.getAttribute('text')).toBe('Milim Nava');
    const message2_element = await driver.elementById('android:id/message');
    expect((await message2_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Disable',
    );
    const button3_element = await driver.elementById('android:id/button3');
    await button3_element.click();

    console.debug('Disable Doctor Ok.');

    const settingsTab_element = await driver.elementByAccessibilityId(
      'Settings, tab, 4 of 4',
    );
    await settingsTab_element.click();
    console.debug('Click Doctor Tab to continue testing.');
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
  });
  test('Enable Doctor', async () => {
    const doctorTab_element = await driver.elementByAccessibilityId(
      'Doctor, tab, 2 of 4',
    );
    await doctorTab_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Milim Nava')).toBe(true);
    const Milim_element = await driver.elementByAccessibilityId('Milim Nava');
    await Milim_element.click();

    while (!(await driver.hasElementById('android:id/alertTitle'))) {
      await driver.sleep(1000);
    }
    const alertTitle_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle_element.getAttribute('text')).toBe('Milim Nava');
    const message_element = await driver.elementById('android:id/message');
    expect((await message_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Disable',
    );
    const button1_element = await driver.elementById('android:id/button1');
    await button1_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }

    await Milim_element.click();
    while (!(await driver.hasElementById('android:id/alertTitle'))) {
      await driver.sleep(1000);
    }
    const alertTitle2_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle2_element.getAttribute('text')).toBe('Milim Nava');
    const message2_element = await driver.elementById('android:id/message');
    expect((await message2_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Enable',
    );
    const button3_element = await driver.elementById('android:id/button3');
    await button3_element.click();

    console.debug('Enable Doctor Ok.');

    const settingsTab_element = await driver.elementByAccessibilityId(
      'Settings, tab, 4 of 4',
    );
    await settingsTab_element.click();
    console.debug('Click Doctor Tab to continue testing.');
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
  });
  test('Disable Hospital', async () => {
    const hospitalTab_element = await driver.elementByAccessibilityId(
      'Hospital, tab, 3 of 4',
    );
    await hospitalTab_element.click();

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
    const alertTitle_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle_element.getAttribute('text')).toBe(
      'Siriraj Hospital',
    );
    const message_element = await driver.elementById('android:id/message');
    expect((await message_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Enable',
    );
    const button1_element = await driver.elementById('android:id/button1');
    await button1_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_hospital'))) {
      await driver.sleep(1000);
    }

    await Siriraj_element.click();
    while (!(await driver.hasElementById('android:id/alertTitle'))) {
      await driver.sleep(1000);
    }
    const alertTitle2_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle2_element.getAttribute('text')).toBe(
      'Siriraj Hospital',
    );
    const message2_element = await driver.elementById('android:id/message');
    expect((await message2_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Disable',
    );
    const button3_element = await driver.elementById('android:id/button3');
    await button3_element.click();

    console.debug('Disable Hospital Ok.');

    const settingsTab_element = await driver.elementByAccessibilityId(
      'Settings, tab, 4 of 4',
    );
    await settingsTab_element.click();
    console.debug('Click Doctor Tab to continue testing.');
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
  });
  test('Enable Hospital', async () => {
    const hospitalTab_element = await driver.elementByAccessibilityId(
      'Hospital, tab, 3 of 4',
    );
    await hospitalTab_element.click();

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
    const alertTitle_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle_element.getAttribute('text')).toBe(
      'Siriraj Hospital',
    );
    const message_element = await driver.elementById('android:id/message');
    expect((await message_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Disable',
    );
    const button1_element = await driver.elementById('android:id/button1');
    await button1_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_hospital'))) {
      await driver.sleep(1000);
    }

    await Siriraj_element.click();
    while (!(await driver.hasElementById('android:id/alertTitle'))) {
      await driver.sleep(1000);
    }
    const alertTitle2_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle2_element.getAttribute('text')).toBe(
      'Siriraj Hospital',
    );
    const message2_element = await driver.elementById('android:id/message');
    expect((await message2_element.getAttribute('text')).split('\n')[1]).toBe(
      'Status : Enable',
    );
    const button3_element = await driver.elementById('android:id/button3');
    await button3_element.click();

    console.debug('Enable Hospital Ok.');

    const settingsTab_element = await driver.elementByAccessibilityId(
      'Settings, tab, 4 of 4',
    );
    await settingsTab_element.click();
    console.debug('Click Doctor Tab to continue testing.');
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
  });
  test('Remove Hospital', async () => {
    const hospitalTab_element = await driver.elementByAccessibilityId(
      'Hospital, tab, 3 of 4',
    );
    await hospitalTab_element.click();

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
    const alertTitle_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle_element.getAttribute('text')).toBe(
      'Siriraj Hospital',
    );
    const button2_element = await driver.elementById('android:id/button2');
    await button2_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_hospital'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Siriraj Hospital')).toBe(
      false,
    );
    console.debug('Remove Hospital Ok.');

    const settingsTab_element = await driver.elementByAccessibilityId(
      'Settings, tab, 4 of 4',
    );
    await settingsTab_element.click();
    console.debug('Click Doctor Tab to continue testing.');
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
  });
  test('Remove Doctor', async () => {
    const doctorTab_element = await driver.elementByAccessibilityId(
      'Doctor, tab, 2 of 4',
    );
    await doctorTab_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Milim Nava')).toBe(true);
    const Milim_element = await driver.elementByAccessibilityId('Milim Nava');
    await Milim_element.click();

    while (!(await driver.hasElementById('android:id/alertTitle'))) {
      await driver.sleep(1000);
    }
    const alertTitle_element = await driver.elementById(
      'android:id/alertTitle',
    );
    expect(await alertTitle_element.getAttribute('text')).toBe('Milim Nava');
    const button2_element = await driver.elementById('android:id/button2');
    await button2_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Doctor'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Milim Nava')).toBe(false);
    console.debug('Remove Doctor Ok.');
  });
});
