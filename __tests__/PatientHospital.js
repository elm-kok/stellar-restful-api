import wd from 'wd';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
const PORT = 4723;
const config = {
  platformName: 'Android',
  deviceName: 'Pixel_3_API_29',
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

haveInfo = async () => {
  const infoTab_element = await driver.elementByAccessibilityId(
    'Info, tab, 1 of 4',
  );
  await infoTab_element.click();
  await driver.sleep(3000);
  await toggleAction.perform();
  await driver.sleep(15000);
  expect(await driver.hasElementByAccessibilityId('LabID_10')).toBe(true);
  await swipeRightAction.perform();
  await driver.sleep(3000);
  expect(await driver.hasElementByAccessibilityId('Clindamycin')).toBe(true);
  await swipeRightAction.perform();
  await driver.sleep(3000);
  expect(await driver.hasElementByAccessibilityId('DOMPERIDONE TAB10MG.')).toBe(
    true,
  );
  await swipeRightAction.perform();
  console.debug('Records are available. Ok.');
};
haveNotInfo = async () => {
  const infoTab_element = await driver.elementByAccessibilityId(
    'Info, tab, 1 of 4',
  );
  await infoTab_element.click();
  await driver.sleep(3000);
  await toggleAction.perform();
  await driver.sleep(15000);
  expect(await driver.hasElementByAccessibilityId('LabID_10')).toBe(false);
  await swipeRightAction.perform();
  await driver.sleep(3000);
  expect(await driver.hasElementByAccessibilityId('Clindamycin')).toBe(false);
  await swipeRightAction.perform();
  await driver.sleep(3000);
  expect(await driver.hasElementByAccessibilityId('DOMPERIDONE TAB10MG.')).toBe(
    false,
  );
  await swipeRightAction.perform();
  console.debug('Records are not available. Ok.');
};

describe('Patient-Hospital', () => {
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
    expect(await driver.elementByAccessibilityId('login').isEnabled()).toBe(
      true,
    );
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
  test('Change Name', async () => {
    const settingsTab_element = await driver.elementByAccessibilityId(
      'Settings, tab, 4 of 4',
    );
    await settingsTab_element.click();

    while (!(await driver.hasElementByAccessibilityId('Name_setting'))) {
      await driver.sleep(1000);
    }
    const Name_setting_element = await driver.elementByAccessibilityId(
      'Name_setting',
    );
    expect(await Name_setting_element.getAttribute('text')).toBe(
      'Hi, Rimuru Tempest',
    );

    const changeBt_setting_element = await driver.elementByAccessibilityId(
      'changeBt_setting',
    );
    await changeBt_setting_element.click();

    while (!(await driver.hasElementByAccessibilityId('fName_setting'))) {
      await driver.sleep(1000);
    }
    await driver
      .elementByAccessibilityId('fName_setting')
      .sendKeys('Rimuru-sama');
    await driver
      .elementByAccessibilityId('lName_setting')
      .sendKeys('Tempest-dakara');
    const submit_setting_element = await driver.elementByAccessibilityId(
      'submit_setting',
    );
    await submit_setting_element.click();

    while (!(await driver.hasElementByAccessibilityId('Name_setting'))) {
      await driver.sleep(1000);
    }
    const cName_setting_element = await driver.elementByAccessibilityId(
      'Name_setting',
    );
    expect(await cName_setting_element.getAttribute('text')).toBe(
      'Hi, Rimuru-sama Tempest-dakara',
    );
    console.debug('Change Name Ok.');
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

  test('Have Info (Patient Record in Info view)', async () => {
    await haveInfo();
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
  });

  test('No Info (Patient Record in Info view)', async () => {
    await haveNotInfo();
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
  });

  test('Have Info (Patient Record in Info view)', async () => {
    await haveInfo();
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
  });

  test('No Info (Patient Record in Info view)', async () => {
    await haveNotInfo();
  });
});
