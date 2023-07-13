import {
  addNodeTypeToPaper,
  getElementAtPosition,
  getPeriodicityStringUSFormattedDate,
  toggleInspector,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';
import moment from 'moment';

const startTimerEventPosition = { x: 350, y: 250 };

function addStartTimerEventToPaper(){
  addNodeTypeToPaper(startTimerEventPosition, nodeTypes.startEvent, 'switch-to-start-timer-event');
}

describe('Start Timer Event', () => {

  const now = new Date();
  const today = now.getDate().toString().padStart(2, '0');

  beforeEach(() => {
    toggleInspector();
  });

  it('can set a specific start date', () => {
    addStartTimerEventToPaper();
    waitToRenderAllShapes();

    const toggledPeriod = moment(now).format('A') === 'AM' ? 'PM' : 'AM';
    const expectedStartDate = `${getPeriodicityStringUSFormattedDate(now)} 5:30 ${toggledPeriod}`;

    cy.contains('Timing Control').click();
    cy.get('[data-test=start-date-picker]').click();
    cy.get('.vdpHoursInput').type('5', { force: true });
    cy.get('.vdpMinutesInput').type('300');
    cy.get('.vdp12HourToggleBtn').click();
    // //compare date and hours to avoid the problems caused when there are some seconds of delay
    cy.get('[data-test=start-date-picker] > input').should('contain.value', expectedStartDate.substr(0, 14));
  });

  it('can set a specific end date', () => {
    addStartTimerEventToPaper();
    waitToRenderAllShapes();
    const expectedEndDate = getPeriodicityStringUSFormattedDate(now, true);

    cy.contains('Timing Control').click();
    cy.get('[data-test=end-date-picker]').click({ force: true });
    typeIntoTextInput('[data-test=repeat-input]', 3);
    cy.get('[data-test=ends-on]').click('left', { force: true });
    cy.get('[data-test=end-date-picker]').click();
    // //compare date and hours to avoid the problems caused when there are some seconds of delay
    cy.get('[data-test=end-date-picker] > input').should('contain.value', expectedEndDate.substr(0, 14));
    cy.get('.paper-container').click( { force: true } );
    getElementAtPosition(startTimerEventPosition).click();
    cy.contains('Timing Control').click();
    cy.get('[data-test=end-date-picker] > input').should('contain.value', expectedEndDate.substr(0, 14));
  });

  it('checks that the timer expressions are correctly formatted', () => {
    addStartTimerEventToPaper();
    waitToRenderAllShapes();

    cy.contains('Timing Control').click();
    cy.get('[data-test=start-date-picker]').click();
    cy.get('.day').contains(today).click();
    cy.get('[title="Select Time"]').click();
    cy.get('[title="Pick Hour"]').click();
    cy.get('.hour').contains('05').click();
    cy.get('[title="Pick Minute"]').click();
    cy.get('.minute').contains('30').click();

    const timerExpression1 = 'R/2019-08-14T05:30:00.000Z/P3W/2019-08-22T05:30:00.000Z';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', timerExpression1);

    cy.get('[data-test=day-2]').click();
    cy.get('[data-test=day-4]').click();

    const timerExpression2 = [
      '2019-08-14T05:30:00.000Z',
      'R/2019-08-20T05:30:00.000Z/P3W/2019-08-22T05:30:00.000Z',
      'R/2019-08-14T05:30:00.000Z/P3W/2019-08-22T05:30:00.000Z',
      'R/2019-08-15T05:30:00.000Z/P3W/2019-08-22T05:30:00.000Z',
    ].join('|');
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', timerExpression2);
  });

  it('Updates properties for periodicity other than "week"', () => {
    const year = 2023;
    const month = 6;
    const day = 18;
    const hour = 14;
    const currentDate = Date.UTC(year, month, day, hour);
    const currentDateString = `${year}-0${month + 1}-${day}T${hour}:00:00.000Z`;

    cy.clock(currentDate);
    addStartTimerEventToPaper();
    cy.tick(1000);
    waitToRenderAllShapes();

    cy.contains('Timing Control').click();
    cy.tick(500);
    const repeat = 3;
    typeIntoTextInput('[data-test=repeat-input]', repeat);
    waitToRenderAllShapes();

    const endDay = 18;
    cy.get('[data-test=ends-on]').click('left', { force: true });
    cy.tick(500);
    cy.get('[data-test=end-date-picker]').click({ force: true });
    cy.tick(500);
    cy.get('[data-test=end-date-picker] > input')
      .click({ force: true });
    cy.tick(500);

    const periods = [
      { selector: 'day', letter: 'D' },
      { selector: 'month', letter: 'M' },
      { selector: 'year', letter: 'Y' },
    ];

    periods.forEach(({ selector, letter }) => {
      cy.get('[data-test=repeat-on-select]').select(selector, { force: true });

      const timerExpression = `R/${currentDateString}/P${repeat}${letter}/2023-0${month + 1}-${endDay}T${hour}:00:01.000Z`;
      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(xml => xml.trim())
        .should('contain', timerExpression);
    });

    cy.get('[data-test=ends-after]').click('left', { force: true });
    cy.tick(500);
    const endsAfter = 4;
    typeIntoTextInput('[data-test=ends-after-input]', endsAfter);

    periods.forEach(({ selector, letter }) => {
      cy.get('[data-test=repeat-on-select]').select(selector);

      const timerExpression = `R${endsAfter}/${currentDateString}/P${repeat}${letter}`;
      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(xml => xml.trim())
        .should('contain', timerExpression);
    });

    const endsNeverExpression = `R/${currentDateString}/P${repeat}Y`;
    cy.get('[data-test=ends-never]').click('left', { force: true });
    cy.tick(500);
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.tick(500);
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', endsNeverExpression);
  });

  it('Does not include selected weekdays for periods other than "week"', () => {
    const year = 2019;
    const month = 7;
    const day = 8;
    const hour = 14;
    const currentDate = Date.UTC(year, month, day, hour);
    const currentDateString = `${year}-0${month + 1}-0${day}T${hour}:00:00.000Z`;

    cy.clock(currentDate);
    addStartTimerEventToPaper();
    cy.tick(1000);
    waitToRenderAllShapes();

    cy.contains('Timing Control').click({ force: true });
    cy.tick(500);
    cy.get('[data-test=day-1]').click();
    cy.tick(500);
    cy.get('[data-test=day-2]').click();
    cy.tick(500);
    cy.get('[data-test=day-3]').click();
    cy.tick(500);
    cy.get('[data-test=repeat-on-select]').select('month');

    const dateExpression = `R/${currentDateString}/P1M`;
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.tick(500);
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', dateExpression);
  });
});
