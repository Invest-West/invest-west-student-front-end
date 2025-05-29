import React from 'react';
import { ProjectInstance, getPitchCover, isImagePitchCover } from '../../models/project';
import { Box, Typography, Card, CardContent, CardMedia } from '@material-ui/core';
import { Image } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import * as appColors from '../../values/colors';

interface CarouselOfferItemProps {
    offer: ProjectInstance;
    onClick: () => void;
}

const CarouselOfferItem: React.FC<CarouselOfferItemProps> = ({ offer, onClick }) => {
    console.log('CarouselOfferItem rendering:', offer.projectDetail.projectName);
    const pitchCover = getPitchCover(offer.projectDetail);
    console.log('CarouselOfferItem pitchCover:', pitchCover);
    
    return (
        <div style={{ background: 'lightblue', padding: '10px', margin: '5px', border: '1px solid blue' }}>
            <h3>DEBUG: {offer.projectDetail.projectName}</h3>
            <p>ID: {offer.projectDetail.id}</p>
            <p>Description: {offer.projectDetail.shortDescription || offer.projectDetail.description}</p>
        </div>
        /*<Card 
            onClick={onClick}
            style={{ 
                cursor: 'pointer', 
                height: '300px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease',
                ':hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
            }}
        >
            <CardMedia style={{ height: '180px', position: 'relative' }}>
                <Box
                    height="100%"
                    width="100%"
                    bgcolor={appColors.dark_green_last_lightness_94_hue_angle_minus_17_color_saturation_100}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    {pitchCover ? (
                        isImagePitchCover(pitchCover) ? (
                            <Image 
                                src={pitchCover.url} 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover' 
                                }} 
                            />
                        ) : (
                            <ReactPlayer 
                                url={pitchCover.url} 
                                light={true} 
                                width="100%" 
                                height="100%" 
                                playing={false} 
                                controls={false} 
                            />
                        )
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            No Image
                        </Typography>
                    )}
                </Box>
            </CardMedia>
            
            <CardContent style={{ padding: '16px', height: '120px', overflow: 'hidden' }}>
                <Typography 
                    variant="h6" 
                    component="h3"
                    style={{ 
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: '8px',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {offer.projectDetail.projectName}
                </Typography>
                
                <Typography 
                    variant="body2" 
                    color="textSecondary"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4'
                    }}
                >
                    {offer.projectDetail.shortDescription || 'No description available'}
                </Typography>
                
                {offer.projectDetail.amountRaised && (
                    <Typography 
                        variant="body2" 
                        style={{ 
                            marginTop: '8px',
                            fontWeight: 500,
                            color: appColors.primaryColor 
                        }}
                    >
                        Raised: £{offer.projectDetail.amountRaised.toLocaleString()}
                    </Typography>
                )}
            </CardContent>
        </Card>*/
    );
};

export default CarouselOfferItem;