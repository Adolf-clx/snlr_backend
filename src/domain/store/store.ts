import { Entity } from '@/shared/kernel/entities/entity'
import { UniqueEntityID } from '@/shared/kernel/value-objects/unique-entity-id'
import { StoreName } from './value-objects/store-name'
import { StoreCode } from './value-objects/store-code'

export interface StoreProps {
  name: StoreName
  code: StoreCode
  address: string
  phone: string
  longitude: number | null
  latitude: number | null
  isOpen: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface CreateStoreProps {
  name: string
  code: string
  address: string
  phone: string
  longitude?: number | null
  latitude?: number | null
  isOpen?: boolean
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export interface RestoreStoreProps {
  name: string
  code: string
  address: string
  phone: string
  longitude: number | null
  latitude: number | null
  isOpen: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export class Store extends Entity<StoreProps> {
  get name(): string {
    return this.props.name.value
  }

  set name(name: string) {
    this.props.name = StoreName.create(name)
    this.touch()
  }

  get code(): string {
    return this.props.code.value
  }

  get address(): string {
    return this.props.address
  }

  set address(address: string) {
    this.props.address = address
    this.touch()
  }

  get phone(): string {
    return this.props.phone
  }

  set phone(phone: string) {
    this.props.phone = phone
    this.touch()
  }

  get longitude(): number | null {
    return this.props.longitude
  }

  get latitude(): number | null {
    return this.props.latitude
  }

  get isOpen(): boolean {
    return this.props.isOpen
  }

  set isOpen(isOpen: boolean) {
    this.props.isOpen = isOpen
    this.touch()
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt
  }

  touch(): void {
    this.props.updatedAt = new Date()
  }

  isActive(): boolean {
    return this.deletedAt === null
  }

  deactivate() {
    if (this.deletedAt) throw new Error('Store already deleted')
    this.props.deletedAt = new Date()
    this.touch()
  }

  restore() {
    if (!this.deletedAt) throw new Error('Store not deleted')
    this.props.deletedAt = null
    this.touch()
  }

  static create(props: CreateStoreProps, id?: string): Store {
    return new Store(
      {
        name: StoreName.create(props.name),
        code: StoreCode.create(props.code),
        address: props.address,
        phone: props.phone,
        longitude: props.longitude ?? null,
        latitude: props.latitude ?? null,
        isOpen: props.isOpen ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      UniqueEntityID.create(id)
    )
  }

  static restore(props: RestoreStoreProps, id: string): Store {
    return new Store(
      {
        name: StoreName.restore(props.name),
        code: StoreCode.restore(props.code),
        address: props.address,
        phone: props.phone,
        longitude: props.longitude,
        latitude: props.latitude,
        isOpen: props.isOpen,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        deletedAt: props.deletedAt ?? null,
      },
      UniqueEntityID.restore(id)
    )
  }
}
