import React from 'react';
import PropTypes from 'prop-types';

const StarRating = ({ count = 5, value = 0, size = 24, edit = false, onChange = () => {} }) => {
  const handleClick = (index, isHalf) => {
    if (!edit) return;

    // Adjust value calculation based on whether it's a half-click or full-click
    const newValue = isHalf ? index + 0.5 : index + 1;
    onChange(Math.min(newValue, count)); // Ensure the value doesn't exceed the star count
  };

  const getStarClass = (index) => {
    if (value >= index + 1) {
      return 'full';
    } else if (value >= index + 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  };

  return (
    <div
      className="star-rating"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            display: 'inline-block',
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          {/* Full Star (Clickable area for left half of the star) */}
          <div
            style={{
              position: 'absolute',
              width: '50%',
              height: '100%',
              left: 0,
              top: 0,
              cursor: edit ? 'pointer' : 'default',
            }}
            onClick={() => handleClick(index, true)}
          ></div>

          {/* Right Half (Clickable area for the right half of the star) */}
          <div
            style={{
              position: 'absolute',
              width: '50%',
              height: '100%',
              right: 0,
              top: 0,
              cursor: edit ? 'pointer' : 'default',
            }}
            onClick={() => handleClick(index, false)}
          ></div>

          {/* Full Star */}
          <span
            className={`star ${getStarClass(index)}`}
            style={{
              color: value >= index + 1 ? '#ffb400' : 'transparent',
              fontSize: `${size}px`,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              WebkitTextStroke: '1px #ffb400', // Add gold border for all stars
              zIndex: 1,
              transition: 'color 0.2s ease',
            }}
          >
            ★
          </span>

          {/* Half Star */}
          <span
            className="star half"
            style={{
              color: value >= index + 0.5 ? '#ffb400' : 'transparent',
              fontSize: `${size}px`,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%', // Ensure exactly 50% fill for half stars
              overflow: 'hidden',
              WebkitTextStroke: '1px #ffb400',
              zIndex: 2,
              transition: 'color 0.2s ease',
            }}
          >
            ★
          </span>
        </div>
      ))}
    </div>
  );
};

StarRating.propTypes = {
  count: PropTypes.number,
  value: PropTypes.number,
  size: PropTypes.number,
  edit: PropTypes.bool,
  onChange: PropTypes.func,
};

export default StarRating;
