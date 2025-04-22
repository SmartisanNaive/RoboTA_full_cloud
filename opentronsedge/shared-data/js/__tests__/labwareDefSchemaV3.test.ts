import path from 'path'
import glob from 'glob'
import { describe, expect, it, test } from 'vitest'

import type { LabwareDefinition3 } from '../types'
import Ajv from 'ajv'
import schema from '../../labware/schemas/3.json'

const fixturesDir = path.join(__dirname, '../../labware/fixtures/3')
const definitionsDir = path.join(__dirname, '../../labware/definitions/3')
const globPattern = '**/*.json'

const ajv = new Ajv({ allErrors: true, jsonPointers: true })
const validate = ajv.compile(schema)

const checkGeometryDefinitions = (labwareDef: LabwareDefinition3): void => {
  test('innerLabwareGeometry sections should be sorted top to bottom', () => {
    const geometries = Object.values(labwareDef.innerLabwareGeometry ?? [])
    for (const geometry of geometries) {
      const sectionList = geometry.sections
      const sortedSectionList = sectionList.toSorted(
        (a, b) => b.topHeight - a.topHeight
      )
      expect(sortedSectionList).toStrictEqual(sectionList)
    }
  })

  test('all geometryDefinitionIds should have an accompanying valid entry in innerLabwareGeometry', () => {
    for (const wellName in labwareDef.wells) {
      const wellGeometryId = labwareDef.wells[wellName].geometryDefinitionId

      if (wellGeometryId === undefined) {
        return
      }
      if (
        labwareDef.innerLabwareGeometry === null ||
        labwareDef.innerLabwareGeometry === undefined
      ) {
        return
      }

      expect(wellGeometryId in labwareDef.innerLabwareGeometry).toBe(true)

      // FIXME(mm, 2025-02-04):
      // `wellDepth` != `topFrustumHeight` for ~23/60 definitions.
      //
      // const wellDepth = labwareDef.wells[wellName].depth
      // const topFrustumHeight =
      //   labwareDef.innerLabwareGeometry[wellGeometryId].sections[0].topHeight
      // expect(wellDepth).toEqual(topFrustumHeight)
    }
  })
}

describe(`test labware definitions with schema v3`, () => {
  const definitionPaths = glob.sync(globPattern, {
    cwd: definitionsDir,
    absolute: true,
  })
  const fixturePaths = glob.sync(globPattern, {
    cwd: fixturesDir,
    absolute: true,
  })
  const allPaths = definitionPaths.concat(fixturePaths)

  test("paths didn't break, which would give false positives", () => {
    expect(definitionPaths.length).toBeGreaterThan(0)
    expect(fixturePaths.length).toBeGreaterThan(0)
  })

  describe.each(allPaths)('%s', labwarePath => {
    const labwareDef = require(labwarePath) as LabwareDefinition3

    it('validates against schema', () => {
      const valid = validate(labwareDef)
      const validationErrors = validate.errors

      // FIXME(mm, 2025-02-04): These new definitions have a displayCategory that
      // the schema does not recognize. Either they need to change or the schema does.
      const expectFailure = ['protocol_engine_lid_stack_object'].includes(
        labwareDef.parameters.loadName
      )

      if (expectFailure) expect(validationErrors).not.toBe(null)
      else expect(validationErrors).toBe(null)
      expect(valid).toBe(!expectFailure)
    })

    checkGeometryDefinitions(labwareDef)
  })
})
