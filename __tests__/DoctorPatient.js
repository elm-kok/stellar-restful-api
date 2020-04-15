import wd from 'wd';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
const PORT = 5723;
const config = {
  platformName: 'Android',
  deviceName: 'emulator-5556',
  avd: 'Pixel_3_API_29_2',
  uiautomator2ServerLaunchTimeout: 399999,
  androidInstallTimeout: 399999,
  uiautomator2ServerInstallTimeout: 399999,
  avdLaunchTimeout: 399999,
  avdReadyTimeout: 399999,
  adbExecTimeout: 399999,
  newCommandTimeout: 399999,
  app:
    '/media/kok/Data/react-native/Frontend/Doctor/StellarUI/android/app/build/outputs/apk/debug/app-debug.apk',
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

haveInfoDoctor = async () => {
  const infoTab_element = await driver.elementByAccessibilityId(
    'Doctor, tab, 2 of 4',
  );
  await infoTab_element.click();

  while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
    await driver.sleep(1000);
  }
  const Rimuru_element = await driver.elementByAccessibilityId(
    'Rimuru Tempest',
  );
  await Rimuru_element.click();

  await driver.sleep(3000);
  await toggleAction.perform();
  while (!(await driver.hasElementByAccessibilityId('LabID_10'))) {
    await driver.sleep(1000);
  }
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

  while (!(await driver.hasElementByAccessibilityId('Settings, tab, 4 of 4'))) {
    await driver.sleep(1000);
  }
  const settingsTab_element = await driver.elementByAccessibilityId(
    'Settings, tab, 4 of 4',
  );
  await settingsTab_element.click();
  console.debug('Click Doctor Tab to continue testing.');
  await driver.sleep(2000);
  while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
    await driver.sleep(1000);
  }
};
haveNotInfoDoctor = async () => {
  const infoTab_element = await driver.elementByAccessibilityId(
    'Doctor, tab, 2 of 4',
  );
  await infoTab_element.click();

  while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
    await driver.sleep(1000);
  }
  const Rimuru_element = await driver.elementByAccessibilityId(
    'Rimuru Tempest',
  );
  await Rimuru_element.click();

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
  while (!(await driver.hasElementByAccessibilityId('Settings, tab, 4 of 4'))) {
    await driver.sleep(1000);
  }
  const settingsTab_element = await driver.elementByAccessibilityId(
    'Settings, tab, 4 of 4',
  );
  await settingsTab_element.click();
  console.debug('Click Doctor Tab to continue testing.');
  await driver.sleep(2000);
  while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
    await driver.sleep(1000);
  }
};

describe('Doctor-Patient', () => {
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
    await driver.elementByAccessibilityId('ID').sendKeys('2222222222222');
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
    await driver.elementByAccessibilityId('fName').sendKeys('Milim');
    expect(await driver.elementByAccessibilityId('login').isEnabled()).toBe(
      false,
    );
    await driver.elementByAccessibilityId('lName').sendKeys('Nava');
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
  test('Change mode to Doctor', async () => {
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
      'Hi, Milim Nava',
    );

    const mode_setting_element = await driver.elementByAccessibilityId(
      'mode_setting',
    );
    await mode_setting_element.click();

    while (!(await driver.hasElementByAccessibilityId('header_Patient'))) {
      await driver.sleep(1000);
    }
    console.debug('Change mode to Doctor Ok.');
  });
  test('Add Patient', async () => {
    const DoctorTab_element = await driver.elementByAccessibilityId(
      'Doctor, tab, 2 of 4',
    );
    await DoctorTab_element.click();
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
      await driver.sleep(1000);
    }
    const add_patient_element = await driver.elementByAccessibilityId(
      'add_Patient',
    );
    await add_patient_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_patientScan'))) {
      await driver.sleep(1000);
    }
    const name_patientScan_element = await driver.elementByAccessibilityId(
      'name_patientScan',
    );
    expect(await name_patientScan_element.getAttribute('text')).toBe(
      'Add Rimuru Tempest',
    );

    const add_patientScan_element = await driver.elementByAccessibilityId(
      'add_patientScan',
    );
    await add_patientScan_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Rimuru Tempest')).toBe(
      true,
    );
    console.debug('Add Doctor Ok.');

    const settingsTab_element = await driver.elementByAccessibilityId(
      'Settings, tab, 4 of 4',
    );
    await settingsTab_element.click();
    console.debug('Click Doctor Tab to continue testing.');
    await driver.sleep(2000);
    while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
      await driver.sleep(1000);
    }
  });
  test('Have Info (Patient Record in Doctor Info view)', async () => {
    await haveInfoDoctor();
  });
  test('No Info (Patient Record in Doctor Info view)', async () => {
    await haveNotInfoDoctor();
  });
  test('Have Info (Patient Record in Doctor Info view)', async () => {
    await haveInfoDoctor();
  });
  test('No Info (Patient Record in Doctor Info view)', async () => {
    await haveNotInfoDoctor();
  });
  test('Have Info (Patient Record in Doctor Info view)', async () => {
    await haveInfoDoctor();
  });
  test('No Info (Patient Record in Doctor Info view)', async () => {
    await haveNotInfoDoctor();
  });
  test('No Info (Patient Record in Doctor Info view)', async () => {
    await haveNotInfoDoctor();
  });
  test('Remove Patient', async () => {
    const doctorTab_element = await driver.elementByAccessibilityId(
      'Doctor, tab, 2 of 4',
    );
    await doctorTab_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Rimuru Tempest')).toBe(
      true,
    );
    const Rimuru_element = await driver.elementByAccessibilityId(
      'Rimuru Tempest',
    );
    await Rimuru_element.click();

    while (!(await driver.hasElementByAccessibilityId('remove_PatientInfo'))) {
      await driver.sleep(1000);
    }
    const remove_PatientInfo_element = await driver.elementByAccessibilityId(
      'remove_PatientInfo',
    );
    await remove_PatientInfo_element.click();

    while (!(await driver.hasElementByAccessibilityId('add_Patient'))) {
      await driver.sleep(1000);
    }
    expect(await driver.hasElementByAccessibilityId('Rimuru Tempest')).toBe(
      false,
    );
    console.debug('Remove Patient Ok.');
  });
});
