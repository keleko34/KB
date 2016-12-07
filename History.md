# History

## 0.6.8 / 2016-12-06

- [Update] added 'events' special attr listener to listen for all event changes including addEventListener and removeEventListener

## 0.6.6 / 2016-12-06

- [Update] added ability to check if a listener method already exists for an attr or attrupdate

## 0.6.1 / 2016-11-23

- [Update] added 'html' special attr listener to listen for all html changes

## 0.6.1 / 2016-11-23

- [Update] update build tool to use K_Tasks npm module

## 0.2.4 / 2016-05-12

- [Update] allow '*' all listener for listening to globally all changes

## 0.2.2 / 2016-05-12

- [Update] allow to get and see the listener objects

## 0.1.8 / 2016-05-05

- [Update] listeners can be applied directly to individual elements now rather than just global

## 0.1.5 / 2016-05-05

- [Update] Textarea value change now fires value listener
- [Bug fix] Checkbox and Radio value changes now fire value and checked listeners

## 0.1.2 / 2016-05-04

- [Update] HTML Attribute values are listened to just as if properties eg setAttribute and removeAttribute fire standard events as properties
- [Update] Added value type descriptors to inject for default made object prototype properties
- [Update] Added injectProperty method for injecting a single property
- [Update] inject method can now be ran multiple times on the same object in case of an added property or change to set/update

## 0.1.0 / 2016-05-01

- [Update] Input value event listeners now fire if You attach listener to value attribute

## 0.0.8 / 2016-04-28

- [Update] Allowed for post set event listeners

## 0.0.4 / 2016-04-21

- [Release] Full release as package