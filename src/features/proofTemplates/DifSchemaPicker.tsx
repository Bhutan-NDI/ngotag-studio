'use client'

import React, { JSX, useEffect, useState } from 'react'

import { AxiosResponse } from 'axios'
import { SchemaTypes } from '@/common/enums'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getAllSchemas } from '@/app/api/schema'

// One entry per selected attribute — matches the stored proof-template payload format.
export interface DifPayloadEntry {
  schemaName: string
  names: string[]
  schema: string
}

interface PlatformSchema {
  name: string
  version?: string
  schemaLedgerId: string
  attributes: { attributeName: string; displayName?: string }[]
}

interface DifSchemaPickerProps {
  value: DifPayloadEntry[]
  onChange: (value: DifPayloadEntry[]) => void
}

const SEARCH_PAGE_SIZE = 10

const DifSchemaPicker = ({
  value,
  onChange,
}: DifSchemaPickerProps): JSX.Element => {
  const [search, setSearch] = useState('')
  const [schemas, setSchemas] = useState<PlatformSchema[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        // Platform-wide search (not scoped to the organization); W3C schemas only,
        // since the DIF payload references schemas by URL.
        const response = await getAllSchemas(
          {
            itemPerPage: SEARCH_PAGE_SIZE,
            page: 1,
            search: '',
            sortBy: 'id',
            allSearch: search.trim(),
          },
          SchemaTypes.schema_W3C,
          '',
        )
        const { data } = response as AxiosResponse
        setSchemas(
          data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
            ? (data?.data?.data ?? [])
            : [],
        )
      } catch {
        setSchemas([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  const isSelected = (schemaId: string, attribute: string): boolean =>
    value.some((e) => e.schema === schemaId && e.names[0] === attribute)

  const toggle = (schema: PlatformSchema, attribute: string): void => {
    if (isSelected(schema.schemaLedgerId, attribute)) {
      onChange(
        value.filter(
          (e) =>
            !(e.schema === schema.schemaLedgerId && e.names[0] === attribute),
        ),
      )
      return
    }
    onChange([
      ...value,
      {
        schemaName: schema.name,
        names: [attribute],
        schema: schema.schemaLedgerId,
      },
    ])
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search schemas by name"
        className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
      />

      <div className="max-h-48 overflow-auto rounded-md border">
        {loading && (
          <p className="text-muted-foreground p-3 text-sm">Searching...</p>
        )}
        {!loading && schemas.length === 0 && (
          <p className="text-muted-foreground p-3 text-sm">No schemas found</p>
        )}
        {!loading &&
          schemas.map((schema) => {
            const open = expanded === schema.schemaLedgerId
            return (
              <div
                key={schema.schemaLedgerId}
                className="border-b last:border-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(open ? null : schema.schemaLedgerId)
                  }
                  className="hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                >
                  <span className="font-medium">
                    {schema.name}
                    {schema.version ? ` (v${schema.version})` : ''}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {open ? 'Hide' : 'Attributes'}
                  </span>
                </button>
                {open && (
                  <div className="grid grid-cols-2 gap-1 px-3 pb-2">
                    {(schema.attributes ?? []).map((attr) => (
                      <label
                        key={attr.attributeName}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected(
                            schema.schemaLedgerId,
                            attr.attributeName,
                          )}
                          onChange={() => toggle(schema, attr.attributeName)}
                        />
                        {attr.displayName || attr.attributeName}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((e) => (
            <span
              key={`${e.schema}-${e.names[0]}`}
              className="bg-secondary flex items-center gap-1 rounded-full px-2 py-1 text-xs"
            >
              {e.schemaName}: {e.names[0]}
              <button
                type="button"
                aria-label="Remove"
                onClick={() =>
                  onChange(
                    value.filter(
                      (x) =>
                        !(x.schema === e.schema && x.names[0] === e.names[0]),
                    ),
                  )
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default DifSchemaPicker
