import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { Booking } from "../../booking/model/booking.model"

export interface Chip {
    name: string
    id: string
}

export interface ArtistStyle extends Chip {}

export interface ArtistLabel extends Chip {}

export interface ArtistMedia {
    code: string,
    url: string
}

export interface FireImg {
    firePath: string
    url: string
}

export interface FireImgSet {
    name: string
    bg?: FireImg
    miniBg?: FireImg

    avatar?: FireImg
    mini?: FireImg
}

export interface Images {
    avatar?: FireImgSet
    bg?: FireImgSet[]
}


export type DiscountDocument = HydratedDocument<Artist>

export type ArtistStatus = 'CREATED' | 'READY' | 'ACTIVE'

@Schema()
export class Artist {

    @Prop({ required: true })
    signature: string

    @Prop({ required: true })
    managerUid?: string

    @Prop({ required: true })
    status: ArtistStatus


    @Prop({ required: true })
    name: string
    
    @Prop()
    countryCode: string

    @Prop()
    styles: ArtistStyle[]
    
    @Prop()
    labels: ArtistLabel[]



    @Prop()
    firstName?: string
    
    @Prop()
    lastName?: string
    
    @Prop()
    email: string
    
    @Prop()
    phone: string
    
    @Prop()
    medias?: ArtistMedia[]
    
    @Prop({ type: Object })
    images: Images

    @Prop()
    bio: string

    @Prop()
    managmentNotes: string
    
    @Prop()
    bookings?: Partial<Booking>[]

}

export const ArtistSchema = SchemaFactory.createForClass(Artist)