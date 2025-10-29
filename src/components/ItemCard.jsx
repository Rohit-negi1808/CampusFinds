import React from 'react';
import { truncateText, formatDate, capitalizeFirstLetter, getImageUrl } from '../utils';

const ItemCard = ({ item, showItemDetail }) => {
    const badgeClass = item.type === 'lost' ? 'badge-lost' : 'badge-found';
    const badgeText = item.type === 'lost' ? 'Lost' : 'Found';

    return (
        <div className="col-md-6 col-lg-4">
            <div
                className="card"
                onClick={() => showItemDetail('item-detail', item)}
                style={{ cursor: 'pointer' }}
            >
                {item.imageUrl ? (
                    <div
                        style={{
                            width: "100%",
                            height: "150px",       // limit height
                            overflow: "hidden",
                            borderTopLeftRadius: "0.25rem",
                            borderTopRightRadius: "0.25rem"
                        }}
                    >
                        <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.title}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",   // scale without cropping
                                display: "block",
                                margin: "0 auto"
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className="card-img-top d-flex align-items-center justify-content-center bg-light"
                        style={{ height: '200px' }}
                    >
                        <span className="text-muted">No Image</span>
                    </div>
                )}

                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{item.title}</h5>
                        <span className={`badge ${badgeClass}`}>{badgeText}</span>
                    </div>

                    <p className="card-text text-muted">
                        <small>
                            {item.type === 'lost'
                                ? (item.dateLost ? formatDate(item.dateLost) : "Date not provided")
                                : (item.dateFound ? formatDate(item.dateFound) : "Date not provided")}
                        </small>
                    </p>

                    <p className="card-text">{truncateText(item.description, 100)}</p>

                    <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-secondary">
                            {capitalizeFirstLetter(item.category || "Uncategorized")}
                        </span>
                        <button className="btn btn-sm btn-outline-primary">View Details</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
