import React, { useState } from 'react';
import Badge from './Badge';
import Input from './Input';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TagInput({ label, tags = [], onTagsChange, placeholder, error, ...props }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleBlur = () => {
      if (inputValue.trim()) {
          addTag();
      }
  }

  const addTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !tags.includes(trimmedInput)) {
      onTagsChange([...tags, trimmedInput]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <Input
        label={label}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder || "Escribe y presiona Enter..."}
        error={error}
        {...props}
      />
      <div className="flex flex-wrap gap-2 min-h-[30px]">
        {tags.map((tag, index) => (
          <Badge key={index} variant="default" className="pr-1 pl-2 py-1 gap-1 text-sm bg-gray-200">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-gray-300 rounded-full p-0.5 focus:outline-none"
            >
              <XMarkIcon className="h-3 w-3 text-gray-500 hover:text-red-500" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
